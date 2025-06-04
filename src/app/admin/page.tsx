"use client";

import AdminRoute from "@/components/admin-route";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [apiKey, setApiKey] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: "", message: "" });

  // Load the current system prompt from the server when the component mounts
  useEffect(() => {
    fetch("/api/admin/gemini")
      .then((res) => res.json())
      .then((data) => {
        if (data.systemPrompt) setSystemPrompt(data.systemPrompt);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleApiKeyUpdate = async () => {
    if (!apiKey.trim()) {
      setUpdateMessage({ type: "error", message: "API key cannot be empty" });
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateApiKey", value: apiKey }),
      });
      if (res.ok) {
        setUpdateMessage({ type: "success", message: "API key updated successfully" });
        setApiKey("");
      } else {
        const data = await res.json();
        setUpdateMessage({ type: "error", message: data.error || "Failed to update API key" });
      }
    } catch (error) {
      setUpdateMessage({ type: "error", message: "Failed to update API key" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSystemPromptUpdate = async () => {
    if (!systemPrompt.trim()) {
      setUpdateMessage({ type: "error", message: "System prompt cannot be empty" });
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateSystemPrompt", value: systemPrompt }),
      });
      if (res.ok) {
        setUpdateMessage({ type: "success", message: "System prompt updated successfully" });
      } else {
        const data = await res.json();
        setUpdateMessage({ type: "error", message: data.error || "Failed to update system prompt" });
      }
    } catch (error) {
      setUpdateMessage({ type: "error", message: "Failed to update system prompt" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Sample data for the dashboard
  const usageStats = {
    totalUsers: 127,
    activeUsers: 42,
    totalReports: 315,
    reportsToday: 18,
    apiCalls: 289,
    averageProcessingTime: "2.3s",
  };

  // Sample data for user activity
  const userActivity = [
    { time: "2025-04-02 21:45", user: "user123@example.com", action: "Uploaded lab report", reportType: "Blood Panel" },
    { time: "2025-04-02 21:30", user: "user456@example.com", action: "Viewed trends", reportType: "N/A" },
    { time: "2025-04-02 21:15", user: "user789@example.com", action: "Uploaded lab report", reportType: "Lipid Panel" },
    { time: "2025-04-02 21:00", user: "user123@example.com", action: "Exported results", reportType: "N/A" },
    { time: "2025-04-02 20:45", user: "user321@example.com", action: "Uploaded lab report", reportType: "Comprehensive Metabolic Panel" },
  ];

  return (
    <AdminRoute>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-xl font-bold text-primary">
                BloodInsight AI
              </Link>
              <span className="px-2 py-1 rounded text-xs bg-secondary text-secondary-foreground">
                Admin Console
              </span>
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Back to App</Link>
              </Button>
            </nav>
          </div>
        </header>

        <main className="flex-1 container py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Admin Console</h1>
          </div>

          <Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="api-key">API Key</TabsTrigger>
              <TabsTrigger value="system-prompt">System Prompt</TabsTrigger>
              <TabsTrigger value="usage">Usage Monitoring</TabsTrigger>
              <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg border border-border bg-card">
                  <h3 className="text-lg font-medium mb-4">Users</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold">{usageStats.totalUsers}</p>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{usageStats.activeUsers}</p>
                      <p className="text-sm text-muted-foreground">Active Today</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-lg border border-border bg-card">
                  <h3 className="text-lg font-medium mb-4">Reports</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold">{usageStats.totalReports}</p>
                      <p className="text-sm text-muted-foreground">Total Reports</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{usageStats.reportsToday}</p>
                      <p className="text-sm text-muted-foreground">Reports Today</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-lg border border-border bg-card">
                  <h3 className="text-lg font-medium mb-4">API Usage</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold">{usageStats.apiCalls}</p>
                      <p className="text-sm text-muted-foreground">API Calls</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{usageStats.averageProcessingTime}</p>
                      <p className="text-sm text-muted-foreground">Avg. Processing</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Report Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userActivity.map((activity, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="py-3 px-4 text-sm">{activity.time}</td>
                          <td className="py-3 px-4 text-sm">{activity.user}</td>
                          <td className="py-3 px-4 text-sm">{activity.action}</td>
                          <td className="py-3 px-4 text-sm">{activity.reportType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="api-key" className="space-y-6">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-medium mb-4">Update Gemini API Key</h3>
                <p className="text-muted-foreground mb-6">
                  Enter a new API key for the Google Gemini API. This key will be used for all AI analysis operations.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="api-key" className="block text-sm font-medium mb-2">
                      API Key
                    </label>
                    <input
                      id="api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full p-2 rounded-md border border-border bg-background"
                      placeholder="Enter new API key"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleApiKeyUpdate}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    {isUpdating ? "Updating..." : "Update API Key"}
                  </Button>
                  
                  {updateMessage.message && (
                    <div className={`p-3 rounded text-sm ${
                      updateMessage.type === "success" 
                        ? "bg-green-500/10 border border-green-500/30 text-green-500" 
                        : "bg-destructive/10 border border-destructive/30 text-destructive"
                    }`}>
                      {updateMessage.message}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="system-prompt" className="space-y-6">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-medium mb-4">Update System Prompt</h3>
                <p className="text-muted-foreground mb-6">
                  Customize the system prompt used by the AI when analyzing lab reports. This prompt guides the AI's behavior and response format.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="system-prompt" className="block text-sm font-medium mb-2">
                      System Prompt
                    </label>
                    <textarea
                      id="system-prompt"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="w-full p-2 rounded-md border border-border bg-background min-h-[300px]"
                      placeholder="Enter system prompt"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSystemPromptUpdate}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    {isUpdating ? "Updating..." : "Update System Prompt"}
                  </Button>
                  
                  {updateMessage.message && (
                    <div className={`p-3 rounded text-sm ${
                      updateMessage.type === "success" 
                        ? "bg-green-500/10 border border-green-500/30 text-green-500" 
                        : "bg-destructive/10 border border-destructive/30 text-destructive"
                    }`}>
                      {updateMessage.message}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="usage" className="space-y-6">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-medium mb-4">API Usage Statistics</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium mb-2">Daily API Calls</h4>
                    <div className="h-64 bg-secondary/20 rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Chart visualization would appear here</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Cost Tracking</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-md bg-secondary/20">
                        <p className="text-sm text-muted-foreground">Today</p>
                        <p className="text-2xl font-bold">$1.45</p>
                      </div>
                      <div className="p-4 rounded-md bg-secondary/20">
                        <p className="text-sm text-muted-foreground">This Week</p>
                        <p className="text-2xl font-bold">$8.72</p>
                      </div>
                      <div className="p-4 rounded-md bg-secondary/20">
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold">$23.18</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Response Time</h4>
                    <div className="h-64 bg-secondary/20 rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Chart visualization would appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rate-limits" className="space-y-6">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-medium mb-4">Rate Limiting Controls</h3>
                <p className="text-muted-foreground mb-6">
                  Configure rate limits to prevent abuse and control costs.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="user-daily-limit" className="block text-sm font-medium mb-2">
                      User Daily Limit
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        id="user-daily-limit"
                        type="number"
                        defaultValue={10}
                        min={1}
                        className="w-full p-2 rounded-md border border-border bg-background"
                      />
                      <Button>Update</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum number of reports a user can analyze per day
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="global-rate-limit" className="block text-sm font-medium mb-2">
                      Global Rate Limit
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        id="global-rate-limit"
                        type="number"
                        defaultValue={100}
                        min={1}
                        className="w-full p-2 rounded-md border border-border bg-background"
                      />
                      <Button>Update</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum number of API calls per hour across all users
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="cost-cap" className="block text-sm font-medium mb-2">
                      Daily Cost Cap ($)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        id="cost-cap"
                        type="number"
                        defaultValue={50}
                        min={1}
                        step={0.01}
                        className="w-full p-2 rounded-md border border-border bg-background"
                      />
                      <Button>Update</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum daily spending limit for API calls
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <footer className="border-t border-border py-6 bg-background">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 BloodInsight AI. Admin Console.
            </p>
          </div>
        </footer>
      </div>
    </AdminRoute>
  );
}
