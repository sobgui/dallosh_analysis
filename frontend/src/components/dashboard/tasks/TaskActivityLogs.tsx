"use client";

import { useMemo } from "react";
import { CheckCircle2, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { TaskStatus } from "@/types";

interface TaskEvent {
  type: string;
  file_id: string;
  event: string;
  timestamp: string;
  data?: any;
}

interface TaskActivityLogsProps {
  currentStatus: TaskStatus;
  fileId: string;
  events?: TaskEvent[];
  llmProgression?: {
    batch: number;
    total_batches: number;
    total_rows: number;
    rows_processed: number;
    progress_percentage: number;
    current_row_index: number;
    current_row_end: number;
    model_uid?: string;
  } | null;
}

interface ActivityStep {
  step: TaskStatus;
  label: string;
  description: string;
  eventName: string;
}

const ACTIVITY_STEPS: ActivityStep[] = [
  {
    step: "added",
    label: "In Queue",
    description: "Task added to processing queue",
    eventName: "in_queue",
  },
  {
    step: "reading_dataset",
    label: "Starting with Reading Dataset",
    description: "Reading CSV file and validating structure",
    eventName: "reading_dataset",
  },
  {
    step: "process_cleaning",
    label: "Processing: Cleaning",
    description: "Removing duplicates and handling missing values",
    eventName: "process_cleaning",
  },
  {
    step: "sending_to_llm",
    label: "Sending to LLM",
    description: "Processing data through AI model for sentiment analysis, priority, main_topics",
    eventName: "sending_to_llm",
  },
  {
    step: "appending_collumns",
    label: "Appending New Data in Column 'sentiment_score', 'sentiment_analysis', 'priority', 'main_topics'",
    description: "Adding sentiment analysis results to dataset",
    eventName: "appending_collumns",
  },
  {
    step: "saving_file",
    label: "Saving",
    description: "Saving processed dataset to database",
    eventName: "saving_file",
  },
  {
    step: "done",
    label: "Done",
    description: "Task completed successfully",
    eventName: "done",
  },
  {
    step: "done",
    label: "Download",
    description: "Download the file.",
    eventName: "download",
  },
];

export function TaskActivityLogs({ currentStatus, fileId, events = [], llmProgression = null }: TaskActivityLogsProps) {
  // Map events by event name for quick lookup
  const eventsByStep = useMemo(() => {
    const map = new Map<string, TaskEvent>();
    events.forEach((event) => {
      if (event.event && !map.has(event.event)) {
        map.set(event.event, event);
      }
    });
    return map;
  }, [events]);

  const getStepStatus = (step: ActivityStep): "completed" | "in-progress" | "pending" => {
    const statusOrder: TaskStatus[] = [
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

    const currentIndex = statusOrder.indexOf(currentStatus);

    // Map each step to its start and done status indices
    const stepStatusMap: Record<string, { start: number; done: number }> = {
      "in_queue": { start: 0, done: 1 }, // added (0) -> in_queue (1)
      "reading_dataset": { start: 2, done: 3 }, // reading_dataset (2) -> reading_dataset_done (3)
      "process_cleaning": { start: 4, done: 5 }, // process_cleaning (4) -> process_cleaning_done (5)
      "sending_to_llm": { start: 6, done: 7 }, // sending_to_llm (6) -> sending_to_llm_done (7)
      "appending_collumns": { start: 8, done: 9 }, // appending_collumns (8) -> appending_collumns_done (9)
      "saving_file": { start: 10, done: 11 }, // saving_file (10) -> saving_file_done (11)
      "done": { start: 12, done: 12 }, // done (12)
      "download": { start: 12, done: 12 }, // download is same as done
    };

    const stepInfo = stepStatusMap[step.eventName];
    if (!stepInfo) return "pending";

    if (currentStatus === "on_error") {
      return "pending";
    }

    if (currentIndex < 0) {
      // If current status is not in order, check if step is completed via events
      const doneEventName = `${step.eventName}_done`;
      if (eventsByStep.has(doneEventName)) {
        return "completed";
      }
      return "pending";
    }

    // Check if step is done via events (more reliable)
    const doneEventName = `${step.eventName}_done`;
    const isDone = eventsByStep.has(doneEventName) || 
                   (step.eventName === "done" && currentStatus === "done");

    // If step is explicitly done, mark as completed
    if (isDone) {
      return "completed";
    }

    // Check if we're past this step
    if (currentIndex > stepInfo.done) {
      return "completed";
    }

    // Check if we're currently in this step (between start and done)
    if (currentIndex >= stepInfo.start && currentIndex <= stepInfo.done) {
      return "in-progress";
    }

    // Otherwise, it's pending
    return "pending";
  };

  const getStepTimestamp = (step: ActivityStep): string | null => {
    // Try to find the done event first
    const doneEventName = `${step.eventName}_done`;
    const doneEvent = eventsByStep.get(doneEventName);
    if (doneEvent) {
      return new Date(doneEvent.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    // Try to find the start event
    const startEvent = eventsByStep.get(step.eventName);
    if (startEvent) {
      return new Date(startEvent.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    return null;
  };

  const getStatusIcon = (status: "completed" | "in-progress" | "pending") => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary/20 animate-pulse" />;
      case "pending":
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Activity Logs</h3>
      <div className="space-y-4">
        {ACTIVITY_STEPS.map((activity, index) => {
          const status = getStepStatus(activity);
          const isLast = index === ACTIVITY_STEPS.length - 1;
          const timestamp = getStepTimestamp(activity);

          return (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                {getStatusIcon(status)}
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 mt-2",
                      status === "completed" ? "bg-green-500" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p
                      className={cn(
                        "font-medium",
                        status === "in-progress" && "text-primary",
                        status === "completed" && "text-foreground",
                        status === "pending" && "text-muted-foreground"
                      )}
                    >
                      {activity.label}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    
                    {/* Nested progress bar for LLM step */}
                    {activity.step === "sending_to_llm" && status === "in-progress" && llmProgression && (
                      <div className="mt-3 space-y-2 p-3 bg-muted/50 rounded-md border border-muted">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">
                            Processing Batch {llmProgression.batch} of {llmProgression.total_batches}
                          </span>
                          <span className="text-muted-foreground">
                            {llmProgression.progress_percentage}%
                          </span>
                        </div>
                        <Progress 
                          value={llmProgression.progress_percentage} 
                          className="h-2"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Rows {llmProgression.current_row_index}-{llmProgression.current_row_end} of {llmProgression.total_rows}
                          </span>
                          <span>
                            {llmProgression.rows_processed} / {llmProgression.total_rows} rows processed
                          </span>
                        </div>
                        {llmProgression.model_uid && (
                          <div className="text-xs text-muted-foreground">
                            Model: <span className="font-mono">{llmProgression.model_uid}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {status === "completed" && timestamp && (
                      <>
                        <p className="text-xs text-muted-foreground">Completed</p>
                        <p className="text-xs text-muted-foreground">
                          Completed at {timestamp}
                        </p>
                      </>
                    )}
                    {status === "in-progress" && (
                      <p className="text-xs text-primary">In Progress...</p>
                    )}
                    {status === "pending" && (
                      <p className="text-xs text-muted-foreground">Pending</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
