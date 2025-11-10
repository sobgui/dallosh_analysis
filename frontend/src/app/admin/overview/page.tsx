"use client";

import { Header } from "@/components/layouts/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Clock,
  Grid3x3,
  Table,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminOverviewPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Overview" subtitle="Monitor your data analysis performance" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-green-500">↑</span>
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Queue</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 in progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
              <Grid3x3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4M</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-green-500">↑</span>
                +8% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Columns</CardTitle>
              <Table className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14</div>
              <p className="text-xs text-muted-foreground">— No change</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Status */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Processing Status</CardTitle>
              <CardDescription>Distribution of dataset processing statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Completed", value: 35, color: "#22c55e" },
                      { name: "Processing", value: 8, color: "#f59e0b" },
                      { name: "Queued", value: 4, color: "#3b82f6" },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`) as any}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm">Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Queued</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Datasets Trend</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    { day: "Mon", uploaded: 5, processed: 3 },
                    { day: "Tue", uploaded: 7, processed: 5 },
                    { day: "Wed", uploaded: 4, processed: 6 },
                    { day: "Thu", uploaded: 8, processed: 7 },
                    { day: "Fri", uploaded: 6, processed: 5 },
                    { day: "Sat", uploaded: 3, processed: 4 },
                    { day: "Sun", uploaded: 2, processed: 3 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="uploaded"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="processed"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: "#22c55e" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Datasets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "customer_complaints_2024.csv", rows: "2.3k", cols: 12, status: "Completed" },
                { name: "service_feedback_q1.csv", rows: "1.8k", cols: 15, status: "Processing" },
                { name: "support_tickets_march.csv", rows: "956", cols: 8, status: "Queued" },
              ].map((dataset, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{dataset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {dataset.rows} rows • {dataset.cols} columns
                    </p>
                  </div>
                  <Badge
                    variant={
                      dataset.status === "Completed"
                        ? "default"
                        : dataset.status === "Processing"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {dataset.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Status</span>
                <Badge className="bg-green-500">All Systems Operational</Badge>
              </div>
              <div className="space-y-3">
                {[
                  { service: "AI Processing Engine", status: "Operational" },
                  { service: "Database", status: "Operational" },
                  { service: "File Upload Service", status: "Degraded" },
                  { service: "API Gateway", status: "Operational" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item.service}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          item.status === "Operational" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

