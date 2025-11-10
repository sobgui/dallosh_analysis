"use client";

import { useState, useEffect, useMemo } from "react";
import { filesService, tasksService } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Play, Search, Filter, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { File, Task, TaskStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SidebarFilesListProps {
  onFileSelect: (file: File) => void;
  selectedFileId?: string;
}

type SortField = "filename" | "createdAt" | "status";
type SortOrder = "asc" | "desc";

export function SidebarFilesList({ onFileSelect, selectedFileId }: SidebarFilesListProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [filesData, tasksData] = await Promise.all([
        filesService.findAll(),
        tasksService.findAll(),
      ]);
      setFiles(filesData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskStatus = (fileId: string): Task | undefined => {
    return tasks.find((task) => task.data.file_id === fileId);
  };

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files.filter((file) => {
      // Search filter
      const matchesSearch = file.data.filename
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Status filter
      const task = getTaskStatus(file.uid);
      const status = task?.data.status || "added";
      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter ||
        (statusFilter === "no_task" && !task);

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "filename") {
        aValue = a.data.filename;
        bValue = b.data.filename;
      } else if (sortField === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else if (sortField === "status") {
        const taskA = getTaskStatus(a.uid);
        const taskB = getTaskStatus(b.uid);
        aValue = taskA?.data.status || "added";
        bValue = taskB?.data.status || "added";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [files, tasks, searchQuery, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedFiles.length / itemsPerPage);
  const paginatedFiles = filteredAndSortedFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleProceed = async (file: File) => {
    try {
      const task = getTaskStatus(file.uid);
      if (task) {
        await tasksService.proceed({
          fileId: file.uid,
          filePath: file.data.file_path,
        });
        await loadData();
      }
    } catch (error) {
      console.error("Failed to proceed task:", error);
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading files...</div>;
  }

  // Get unique statuses for filter
  const uniqueStatuses: (TaskStatus | "no_task")[] = Array.from(
    new Set([...tasks.map((t) => t.data.status), "added", "no_task"])
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search and Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={`${sortField}-${sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split("-") as [SortField, SortOrder];
              setSortField(field);
              setSortOrder(order);
            }}
          >
            <SelectTrigger className="flex-1">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="filename-asc">Name (A-Z)</SelectItem>
              <SelectItem value="filename-desc">Name (Z-A)</SelectItem>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              <SelectItem value="status-asc">Status (A-Z)</SelectItem>
              <SelectItem value="status-desc">Status (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-auto">
        <div className="divide-y">
          {paginatedFiles.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "No files found"
                : "No files uploaded yet"}
            </div>
          ) : (
            paginatedFiles.map((file) => {
              const task = getTaskStatus(file.uid);
              const status = task?.data.status || "added";
              const isSelected = selectedFileId === file.uid;

              return (
                <div
                  key={file.uid}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-accent transition-colors",
                    isSelected && "bg-primary/5 text-primary-foreground"
                  )}
                  onClick={() => onFileSelect(file)}
                >
                  <div className="flex items-start gap-3">
                    <FileText className={cn(
                      "h-5 w-5 mt-0.5 flex-shrink-0",
                      isSelected ? "text-primary-foreground" : "text-primary"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm truncate",
                        isSelected ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {file.data.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            status === "done"
                              ? "default"
                              : status === "on_error"
                              ? "destructive"
                              : String(status).includes("processing")
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {status}
                        </Badge>
                        <span className={cn(
                          "text-xs",
                          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {status === "added" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProceed(file);
                        }}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
