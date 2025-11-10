"use client";

import { useState, useEffect } from "react";
import { filesService, tasksService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, TrendingUp, TrendingDown, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Papa from "papaparse";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { Task, File } from "@/types";

interface DatasetAnalysisProps {
  task: Task;
}

interface CSVRow {
  [key: string]: string;
}

const COLORS = {
  positive: "#22c55e",
  neutral: "#f59e0b",
  negative: "#ef4444",
};

type SortField = 'id' | 'full_text' | 'sentiment' | 'priority' | 'main_topic' | 'created_at';
type SortOrder = 'asc' | 'desc';

export function DatasetAnalysis({ task }: DatasetAnalysisProps) {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
  });

  useEffect(() => {
    loadDataset();
  }, [task]);

  const loadDataset = async () => {
    if (!task.data.file_analysed?.path) {
      setLoading(false);
      return;
    }

    try {
      // Get file info
      const fileData = await filesService.findOne(task.data.file_id);
      setFile(fileData);
      
      // Download the analysed file
      const blob = await filesService.download(task.data.file_id, "analysed", "inline");
      const text = await blob.text();
      
      // Parse CSV
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as CSVRow[];
          // Show ALL rows, not limited
          setCsvData(data);
          
          // Calculate stats from ALL data
          const sentimentCounts = {
            positive: 0,
            neutral: 0,
            negative: 0,
          };
          
          data.forEach((row) => {
            const sentiment = row.sentiment?.toLowerCase() || row.sentiment_analysis?.toLowerCase() || "";
            if (sentiment.includes("positive")) sentimentCounts.positive++;
            else if (sentiment.includes("neutral")) sentimentCounts.neutral++;
            else if (sentiment.includes("negative")) sentimentCounts.negative++;
          });
          
          setStats({
            total: data.length,
            ...sentimentCounts,
          });
          
          setLoading(false);
        },
        error: (error: Error) => {
          console.error("CSV parsing error:", error);
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Failed to load dataset:", error);
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedData = [...csvData].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any = a[sortField] || '';
    let bValue: any = b[sortField] || '';
    
    // Handle numeric fields
    if (sortField === 'id' || sortField === 'priority') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }
    
    // Handle date fields
    if (sortField === 'created_at') {
      aValue = new Date(aValue).getTime() || 0;
      bValue = new Date(bValue).getTime() || 0;
    }
    
    // Handle string fields
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
    }
    if (typeof bValue === 'string') {
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDownload = async () => {
    try {
      await filesService.downloadFile(task.data.file_id, "analysed");
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  const sentimentData = [
    { name: "Positive", value: stats.positive, color: COLORS.positive },
    { name: "Neutral", value: stats.neutral, color: COLORS.neutral },
    { name: "Negative", value: stats.negative, color: COLORS.negative },
  ];

  const priorityData = [
    { name: "Low", value: csvData.filter((r) => r.priority === "0" || r.priority?.toLowerCase() === "low").length },
    { name: "Medium", value: csvData.filter((r) => r.priority === "1" || r.priority?.toLowerCase() === "medium").length },
    { name: "High", value: csvData.filter((r) => r.priority === "2" || r.priority?.toLowerCase() === "high").length },
  ];

  const topicData = csvData
    .reduce((acc, row) => {
      const topic = row.main_topic || row.topic || "Unknown";
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topTopics = Object.entries(topicData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, mentions: value }));

  // Top 10 users by post count with sentiment, topic, and priority breakdown
  const userData = csvData.reduce((acc, row) => {
    const userId = row.user_id || "unknown";
    if (!acc[userId]) {
      acc[userId] = {
        user_id: userId,
        screen_name: row.screen_name || "Unknown",
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        high: 0,
        medium: 0,
        low: 0,
        topics: {} as Record<string, number>,
      };
    }
    acc[userId].total++;
    
    // Count sentiment
    const sentiment = row.sentiment?.toLowerCase() || row.sentiment_analysis?.toLowerCase() || "";
    if (sentiment.includes("positive")) acc[userId].positive++;
    else if (sentiment.includes("neutral")) acc[userId].neutral++;
    else if (sentiment.includes("negative")) acc[userId].negative++;
    
    // Count priority
    const priority = row.priority;
    if (priority === "2" || priority?.toLowerCase() === "high") acc[userId].high++;
    else if (priority === "1" || priority?.toLowerCase() === "medium") acc[userId].medium++;
    else acc[userId].low++;
    
    // Count topics
    const topic = row.main_topic || row.topic || "Unknown";
    acc[userId].topics[topic] = (acc[userId].topics[topic] || 0) + 1;
    
    return acc;
  }, {} as Record<string, {
    user_id: string;
    screen_name: string;
    total: number;
    positive: number;
    neutral: number;
    negative: number;
    high: number;
    medium: number;
    low: number;
    topics: Record<string, number>;
  }>);

  const topUsers = Object.values(userData)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((user) => ({
      name: user.screen_name || user.user_id,
      user_id: user.user_id,
      total: user.total,
      positive: user.positive,
      neutral: user.neutral,
      negative: user.negative,
      high: user.high,
      medium: user.medium,
      low: user.low,
      topTopic: Object.entries(user.topics).sort(([, a], [, b]) => b - a)[0]?.[0] || "Unknown",
      topics: user.topics, // Keep full topics object for table display
    }));

  // Agent activity analysis (screen_name, in_reply_to, user_id relationship)
  const agentActivity = csvData.reduce((acc, row) => {
    const screenName = row.screen_name || "Unknown";
    const userId = row.user_id || "unknown";
    const inReplyTo = row.in_reply_to && row.in_reply_to !== "null" && row.in_reply_to !== "" ? row.in_reply_to : null;
    
    if (!acc[screenName]) {
      acc[screenName] = {
        screen_name: screenName,
        user_id: userId,
        total_posts: 0,
        replies_received: 0,
        replies_sent: 0,
        unique_users_replied_to: new Set<string>(),
      };
    }
    
    acc[screenName].total_posts++;
    
    // If this post is a reply to someone
    if (inReplyTo) {
      acc[screenName].replies_sent++;
      acc[screenName].unique_users_replied_to.add(inReplyTo);
    }
    
    // Count how many replies this user received (posts that have in_reply_to = this user's posts)
    // This is approximate - we'd need to check all posts to see if any have in_reply_to matching this user's posts
    return acc;
  }, {} as Record<string, {
    screen_name: string;
    user_id: string;
    total_posts: number;
    replies_received: number;
    replies_sent: number;
    unique_users_replied_to: Set<string>;
  }>);

  // Calculate replies received for each user
  csvData.forEach((row) => {
    const inReplyTo = row.in_reply_to && row.in_reply_to !== "null" && row.in_reply_to !== "" ? row.in_reply_to : null;
    if (inReplyTo) {
      // Find the user who made the original post (by matching tweet IDs)
      const originalPost = csvData.find((r) => r.id === inReplyTo);
      if (originalPost && originalPost.screen_name && agentActivity[originalPost.screen_name]) {
        agentActivity[originalPost.screen_name].replies_received++;
      }
    }
  });

  const agentActivityData = Object.values(agentActivity)
    .map((agent) => ({
      screen_name: agent.screen_name,
      user_id: agent.user_id,
      total_posts: agent.total_posts,
      replies_received: agent.replies_received,
      replies_sent: agent.replies_sent,
      unique_users_replied_to: agent.unique_users_replied_to.size,
      reply_ratio: agent.total_posts > 0 ? (agent.replies_sent / agent.total_posts) * 100 : 0,
    }))
    .sort((a, b) => b.total_posts - a.total_posts);

  if (loading) {
    return <div className="p-6">Loading dataset analysis...</div>;
  }

  if (csvData.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No analysed data available for this task
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{file?.data.filename || task.data.file_id}</h2>
          <p className="text-sm text-muted-foreground">Processed dataset with sentiment analysis</p>
        </div>
        <Button onClick={handleDownload} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Download className="mr-2 h-4 w-4" />
          Download Preprocessed
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Positive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.positive.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Neutral</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.neutral.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Negative</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.negative.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Dataset Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-auto bg-card" style={{ maxHeight: '600px' }}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/50 dark:bg-muted z-10">
                  <TableRow>
                    <TableHead className="min-w-[120px] whitespace-nowrap">
                      <button
                        onClick={() => handleSort('id')}
                        className="flex items-center gap-1 hover:text-primary w-full text-left text-foreground"
                      >
                        ID
                        {sortField === 'id' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[300px] whitespace-nowrap">
                      <button
                        onClick={() => handleSort('full_text')}
                        className="flex items-center gap-1 hover:text-primary w-full text-left text-foreground"
                      >
                        Full Text
                        {sortField === 'full_text' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[120px] whitespace-nowrap">
                      <button
                        onClick={() => handleSort('sentiment')}
                        className="flex items-center gap-1 hover:text-primary w-full text-left text-foreground"
                      >
                        Sentiment
                        {sortField === 'sentiment' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[100px] whitespace-nowrap">
                      <button
                        onClick={() => handleSort('priority')}
                        className="flex items-center gap-1 hover:text-primary w-full text-left text-foreground"
                      >
                        Priority
                        {sortField === 'priority' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[150px] whitespace-nowrap">
                      <button
                        onClick={() => handleSort('main_topic')}
                        className="flex items-center gap-1 hover:text-primary w-full text-left text-foreground"
                      >
                        Topic
                        {sortField === 'main_topic' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[120px] whitespace-nowrap">
                      <button
                        onClick={() => handleSort('created_at')}
                        className="flex items-center gap-1 hover:text-primary w-full text-left text-foreground"
                      >
                        Created At
                        {sortField === 'created_at' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs whitespace-nowrap text-foreground">{row.id || index}</TableCell>
                      <TableCell className="min-w-[300px] text-foreground">
                        <div className="break-words max-w-md">{row.full_text || row.text || ""}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={
                            row.sentiment?.toLowerCase().includes("positive")
                              ? "border-green-500 text-green-600 dark:text-green-400"
                              : row.sentiment?.toLowerCase().includes("negative")
                              ? "border-red-500 text-red-600 dark:text-red-400"
                              : "border-orange-500 text-orange-600 dark:text-orange-400"
                          }
                        >
                          {row.sentiment || row.sentiment_analysis || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={
                            row.priority === "2" || row.priority?.toLowerCase() === "high"
                              ? "border-red-500 text-red-600 dark:text-red-400"
                              : row.priority === "1" || row.priority?.toLowerCase() === "medium"
                              ? "border-orange-500 text-orange-600 dark:text-orange-400"
                              : "border-green-500 text-green-600 dark:text-green-400"
                          }
                        >
                          {row.priority === "2" ? "High" : row.priority === "1" ? "Medium" : "Low"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap text-foreground">{row.main_topic || row.topic || "N/A"}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap text-foreground">
                        {row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(1)}%`) as any}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Top Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTopics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="mentions" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { week: "Week 1", positive: 65, negative: 22 },
                  { week: "Week 2", positive: 68, negative: 20 },
                  { week: "Week 3", positive: 70, negative: 18 },
                  { week: "Week 4", positive: 68, negative: 20 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="positive" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 10 Users Analysis */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Top 10 Users Analysis</CardTitle>
            <CardDescription>Users with most posts: sentiment breakdown and main topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Stacked Bar Chart for Sentiment */}
              <div>
                <h4 className="text-sm font-semibold mb-4">Sentiment Distribution by User</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topUsers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const total = data.positive + data.neutral + data.negative;
                          const avgSentiment = total > 0 
                            ? (data.positive * 1 + data.neutral * 0 + data.negative * -1) / total
                            : 0;
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold">{data.name}</p>
                              <p className="text-xs text-muted-foreground">User ID: {data.user_id}</p>
                              <p className="text-sm mt-2">Total Posts: {data.total}</p>
                              <p className="text-sm mt-1">
                                <span className="font-medium">Avg Sentiment:</span> {avgSentiment > 0 ? '+' : ''}{avgSentiment.toFixed(2)}
                              </p>
                              <div className="mt-2 space-y-1">
                                <p className="text-xs">
                                  <span className="text-green-600">Positive:</span> {data.positive} ({total > 0 ? ((data.positive / total) * 100).toFixed(1) : 0}%)
                                </p>
                                <p className="text-xs">
                                  <span className="text-orange-600">Neutral:</span> {data.neutral} ({total > 0 ? ((data.neutral / total) * 100).toFixed(1) : 0}%)
                                </p>
                                <p className="text-xs">
                                  <span className="text-red-600">Negative:</span> {data.negative} ({total > 0 ? ((data.negative / total) * 100).toFixed(1) : 0}%)
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="positive" stackId="a" fill="#22c55e" name="Positive" />
                    <Bar dataKey="neutral" stackId="a" fill="#f59e0b" name="Neutral" />
                    <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negative" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Topics Table */}
              <div>
                <h4 className="text-sm font-semibold mb-4">Main Topics by User</h4>
                <div className="border rounded-lg overflow-auto max-h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">User</TableHead>
                        <TableHead className="min-w-[100px]">Total Posts</TableHead>
                        <TableHead className="min-w-[120px]">Avg Sentiment</TableHead>
                        <TableHead className="min-w-[200px]">Top Topics</TableHead>
                        <TableHead className="min-w-[100px]">Priority Distribution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topUsers.map((user, index) => {
                        const total = user.positive + user.neutral + user.negative;
                        const avgSentiment = total > 0 
                          ? ((user.positive * 1 + user.neutral * 0 + user.negative * -1) / total)
                          : 0;
                        const topTopics = user.topics
                          ? Object.entries(user.topics)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 3)
                              .map(([topic, count]) => `${topic} (${count})`)
                              .join(', ')
                          : user.topTopic || 'N/A';
                        
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                            <TableCell className="text-foreground">{user.total}</TableCell>
                            <TableCell>
                              <span className={avgSentiment > 0.2 ? "text-green-600 dark:text-green-400" : avgSentiment < -0.2 ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"}>
                                {avgSentiment > 0 ? '+' : ''}{avgSentiment.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-foreground">{topTopics}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 text-xs">
                                <span className="text-red-600 dark:text-red-400">{user.high}H</span>
                                <span className="text-orange-600 dark:text-orange-400">{user.medium}M</span>
                                <span className="text-green-600 dark:text-green-400">{user.low}L</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Activity Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Activity & Customer Engagement</CardTitle>
            <CardDescription>Company agent activity: posts, replies sent/received, and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentActivityData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="screen_name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold">{data.screen_name}</p>
                          <p className="text-xs text-muted-foreground">User ID: {data.user_id}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">Total Posts: {data.total_posts}</p>
                            <p className="text-sm text-green-600">Replies Sent: {data.replies_sent}</p>
                            <p className="text-sm text-blue-600">Replies Received: {data.replies_received}</p>
                            <p className="text-sm text-purple-600">Unique Users Replied To: {data.unique_users_replied_to}</p>
                            <p className="text-sm text-orange-600">Reply Ratio: {data.reply_ratio.toFixed(1)}%</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="total_posts" fill="#ef4444" name="Total Posts" />
                <Bar dataKey="replies_sent" fill="#22c55e" name="Replies Sent" />
                <Bar dataKey="replies_received" fill="#3b82f6" name="Replies Received" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

