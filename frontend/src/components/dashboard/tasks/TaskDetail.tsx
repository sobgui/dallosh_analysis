"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { tasksService, filesService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Play, RotateCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { File, Task, TaskStatus, TaskEventCallback, TaskEventMessage, TaskProgressionEventMessage, TaskProgressionEventCallback } from "@/types";
import { TASK_EVENTS } from "@/configs/constant";
import { TaskActivityLogs } from "./TaskActivityLogs";

interface TaskDetailProps {
  file: File;
  onTaskDeleted?: () => void;
}

const STATUS_STEPS: TaskStatus[] = [
  "added",
  "in_queue",
  "reading_dataset",
  "reading_dataset_done",
  "process_cleaning",
  "process_cleaning_done",
  "sending_to_llm",
  "sending_to_llm_done",
  "appending_collumns",
  "appending_collumns_done",
  "saving_file",
  "saving_file_done",
  "done",
];

interface TaskEvent {
  type: string;
  file_id: string;
  event: string;
  timestamp: string;
  data?: any;
}

export function TaskDetail({ file, onTaskDeleted }: TaskDetailProps) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>("added");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [hasShownDoneToast, setHasShownDoneToast] = useState(false);
  const [llmProgression, setLlmProgression] = useState<{
    batch: number;
    total_batches: number;
    total_rows: number;
    rows_processed: number;
    progress_percentage: number;
    current_row_index: number;
    current_row_end: number;
    model_uid?: string;
  } | null>(null);
  const eventCallbackRef = useRef<TaskEventCallback | null>(null);
  const progressionCallbackRef = useRef<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;
    let usePolling = false;
    
    const init = async () => {
      await loadTask();
      if (isMounted) {
        try {
          await setupRabbitMQListener();
          // Successfully connected, clear any polling
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
          usePolling = false;
        } catch (error: any) {
          // If WebSocket connection fails, fall back to polling
          const errorMessage = error?.message || "";
          if (errorMessage.includes("WebSocket") || errorMessage.includes("connection")) {
            console.warn("[TaskDetail] RabbitMQ connection failed, falling back to polling");
            usePolling = true;
            // Poll task status as fallback if WebSocket connection fails
            if (!pollInterval) {
              pollInterval = setInterval(() => {
                if (isMounted && usePolling) {
                  loadTask();
                }
              }, 5000); // Poll every 5 seconds
            }
          }
        }
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
      usePolling = false;
      // Clear polling interval if set
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      // Cleanup RabbitMQ listener
      if (file.uid) {
        if (eventCallbackRef.current) {
          tasksService.offTaskEvent(file.uid, eventCallbackRef.current);
          eventCallbackRef.current = null;
        } else {
          // Fallback: unsubscribe all if callback ref is not set
          tasksService.offTaskEvent(file.uid);
        }
        if (progressionCallbackRef.current) {
          tasksService.offTaskProgression(file.uid, progressionCallbackRef.current);
          progressionCallbackRef.current = null;
        } else {
          tasksService.offTaskProgression(file.uid);
        }
      }
    };
  }, [file.uid]);

  const loadTask = async () => {
    try {
      console.log(`[TaskDetail] Loading task for file: ${file.uid}`);
      const tasks = await tasksService.findAll({ "data.file_id": file.uid });
      console.log(`[TaskDetail] Found ${tasks.length} task(s) for file ${file.uid}:`, tasks);
      
      if (tasks.length > 0) {
        const foundTask = tasks[0];
        setTask(foundTask);
        const status = foundTask.data.status as TaskStatus;
        console.log(`[TaskDetail] Task status: ${status}`);
        setCurrentStatus(status);
        updateProgress(status);
        
        // Load existing events from task status to show current progress
        // The status field tells us where we are in the process
        if (status && status !== "added") {
          // Task is in progress or completed, we can infer completed steps
          // Events will update this in real-time via SSE
        }
      } else {
        // No task exists yet
        console.log(`[TaskDetail] No task found for file ${file.uid}`);
        setTask(null);
        setCurrentStatus("added");
        updateProgress("added");
      }
    } catch (error) {
      console.error("[TaskDetail] Failed to load task:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRabbitMQListener = async () => {
    try {
      // Define event callback
      const eventCallback: TaskEventCallback = (message: TaskEventMessage) => {
        try {
          // Verify this event is for the current file (defensive check)
          if (message.file_id !== file.uid) {
            console.warn(`[TaskDetail] Received event for different file. Expected: ${file.uid}, Got: ${message.file_id}`);
            return;
          }
          
          console.log(`[TaskDetail] Received RabbitMQ event for file ${file.uid}:`, message);
          
          // Update status based on event name
          const eventName = message.event as TaskStatus;
          setCurrentStatus(eventName);
          updateProgress(eventName);
          
          // Clear LLM progression when LLM step is done
          if (eventName === TASK_EVENTS.SENDING_TO_LLM_DONE || eventName === TASK_EVENTS.DONE) {
            setLlmProgression(null);
          }
          
          // Store event for activity logs
          // Convert TaskEventMessage to TaskEvent format
          const taskEvent: TaskEvent = {
            type: "event",
            file_id: message.file_id,
            event: eventName,
            timestamp: new Date().toISOString(),
            data: message,
          };
          setEvents((prev) => [...prev, taskEvent]);
          
          // Show toast notification when task is done
          if (eventName === "done" && !hasShownDoneToast) {
            setHasShownDoneToast(true);
            toast.success(
              <div className="flex flex-col gap-2">
                <p className="font-medium">Task completed successfully!</p>
                <p className="text-sm text-muted-foreground">
                  Your dataset has been processed and is ready for analysis.
                </p>
                <Button
                  size="sm"
                  className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    toast.dismiss();
                    router.push("/admin/analysis");
                  }}
                >
                  Go to Analysis
                </Button>
              </div>,
              {
                duration: 10000,
                position: "bottom-right",
              }
            );
          }
          
          // Reload task to get latest data from database (microservice should have updated it)
          // This ensures we have the latest status even if events are missed
          setTimeout(() => {
            loadTask();
          }, 500);
        } catch (error) {
          console.error("[TaskDetail] Error handling RabbitMQ event:", error);
        }
      };

      // Define progression callback for LLM progress tracking
      const progressionCallback: TaskProgressionEventCallback = (message: TaskProgressionEventMessage) => {
        try {
          // Verify this event is for the current file
          if (message.file_id !== file.uid) {
            return;
          }
          
          console.log(`[TaskDetail] Received LLM progression event for file ${file.uid}:`, message);
          
          // Update LLM progression state
          if (message.batch && message.total_batches && message.total_rows !== undefined) {
            setLlmProgression({
              batch: message.batch,
              total_batches: message.total_batches,
              total_rows: message.total_rows || 0,
              rows_processed: message.rows_processed || 0,
              progress_percentage: message.progress_percentage || 0,
              current_row_index: message.current_row_index || 0,
              current_row_end: message.current_row_end || 0,
              model_uid: message.model_uid,
            });
          }
        } catch (error) {
          console.error("[TaskDetail] Error handling progression event:", error);
        }
      };

      // Store callback references for cleanup
      eventCallbackRef.current = eventCallback;
      progressionCallbackRef.current = progressionCallback;

      // Subscribe to RabbitMQ events via STOMP
      // This will attempt to connect if not already connected
      await tasksService.onTaskEvent(file.uid, eventCallback);
      
      // Subscribe to progression events
      await tasksService.onTaskProgression(file.uid, progressionCallback);
      
      console.log(`[TaskDetail] Successfully set up RabbitMQ listener for file ${file.uid}`);
    } catch (error: any) {
      console.error("[TaskDetail] Failed to set up RabbitMQ listener:", error);
      const errorMessage = error?.message || "Unknown error";
      
      // Log helpful error message for connection issues
      if (errorMessage.includes("WebSocket") || errorMessage.includes("connection")) {
        console.warn(
          "[TaskDetail] RabbitMQ connection issue. " +
          "Make sure:\n" +
          "1. RabbitMQ is running\n" +
          "2. Web STOMP plugin is enabled: rabbitmq-plugins enable rabbitmq_web_stomp\n" +
          "3. NEXT_PUBLIC_RABBITMQ_URL is set to ws://localhost:15674/ws (not wss:// and not port 15617)\n" +
          "4. RabbitMQ Web STOMP is listening on port 15674\n" +
          "5. Check browser console for the actual connection URL being used"
        );
        // Re-throw so the useEffect can handle fallback polling
        throw error;
      } else {
        // For other errors, show toast but don't throw
        toast.error(`Failed to connect to task events: ${errorMessage}`);
      }
    }
  };

  const updateProgress = (status: TaskStatus) => {
    const currentIndex = STATUS_STEPS.indexOf(status);
    const totalSteps = STATUS_STEPS.length;
    const calculatedProgress = currentIndex >= 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;
    setProgress(calculatedProgress);
  };

  const handleProceed = async () => {
    try {
      await tasksService.proceed({
        fileId: file.uid,
        filePath: file.data.file_path,
      });
      await loadTask();
    } catch (error) {
      console.error("Failed to proceed task:", error);
    }
  };

  const handleDownload = async (source: "cleaned" | "analysed") => {
    try {
      await filesService.downloadFile(file.uid, source);
    } catch (error) {
      console.error("Failed to download file:", error);
      toast.error("Failed to download file");
    }
  };

  const handleRestart = async () => {
    if (!confirm("Are you sure you want to restart this task? This will delete the cleaned and analysed files.")) {
      return;
    }
    try {
      await tasksService.restart(file.uid);
      setHasShownDoneToast(false);
      await loadTask();
      toast.success("Task restarted successfully");
    } catch (error) {
      console.error("Failed to restart task:", error);
      toast.error("Failed to restart task");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task? This will permanently delete the task and associated files.")) {
      return;
    }
    try {
      await tasksService.deleteWithFiles(file.uid);
      toast.success("Task deleted successfully");
      // Call callback to clear selection
      if (onTaskDeleted) {
        onTaskDeleted();
      } else {
        // Fallback: reload the page
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  if (loading) {
    return <div className="p-6">Loading task details...</div>;
  }

  // If no task exists (after loading), show message to create one
  // We check if task is null and we've finished loading
  const hasNoTask = !task && !loading;
  
  if (hasNoTask) {
    return (
      <div className="h-full overflow-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No Task Found</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This file doesn't have an associated task. Create one to start processing.
              </p>
              <Button
                onClick={async () => {
                  try {
                    await tasksService.create({
                      file_id: file.uid,
                      file_path: file.data.file_path,
                      status: "added",
                    });
                    await loadTask();
                    toast.success("Task created successfully");
                  } catch (error) {
                    console.error("Failed to create task:", error);
                    toast.error("Failed to create task");
                  }
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Create Task
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canProceed = currentStatus === "added";
  const canRestart = currentStatus === "done" || currentStatus === "on_error";
  const canDelete = task !== null;
  const filename = file.data.filename.replace('.csv', '');

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Task Header with Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{filename}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Dataset processing task
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canProceed && (
            <Button
              onClick={handleProceed}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          )}
          {canRestart && (
            <Button
              onClick={handleRestart}
              variant="outline"
              size="sm"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Restart
            </Button>
          )}
          {canDelete && (
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

            {/* Activity Logs */}
            <Card>
              <CardContent className="pt-6">
                <TaskActivityLogs 
                  currentStatus={currentStatus} 
                  fileId={file.uid}
                  events={events}
                  llmProgression={llmProgression}
                />
              </CardContent>
            </Card>

      {/* Download Buttons */}
      {(task?.data.file_cleaned?.path || task?.data.file_analysed?.path) && (
        <div className="flex gap-2">
          {task?.data.file_cleaned?.path && (
            <Button
              variant="outline"
              onClick={() => handleDownload("cleaned")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Cleaned
            </Button>
          )}
          {task?.data.file_analysed?.path && (
            <Button
              variant="outline"
              onClick={() => handleDownload("analysed")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Analysed
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
