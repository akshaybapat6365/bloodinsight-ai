"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminRoute from "@/components/admin-route";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import Link from "next/link";
import { useState } from "react";

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState("all");

  // Sample feedback data
  const feedbackItems = [
    {
      id: 1,
      user: "user123@example.com",
      date: "2025-04-01",
      category: "Analysis",
      status: "New",
      message: "The analysis was very helpful, but I wish it would explain more about what my cholesterol levels mean for my overall health."
    },
    {
      id: 2,
      user: "user456@example.com",
      date: "2025-03-30",
      category: "UI/UX",
      status: "In Progress",
      message: "The dark theme is great, but the text is sometimes hard to read on mobile devices."
    },
    {
      id: 3,
      user: "user789@example.com",
      date: "2025-03-28",
      category: "Feature Request",
      status: "Completed",
      message: "It would be helpful to have a way to compare multiple reports side by side."
    },
    {
      id: 4,
      user: "user321@example.com",
      date: "2025-03-25",
      category: "Bug",
      status: "New",
      message: "When I try to upload a PDF with multiple pages, only the first page gets analyzed."
    },
    {
      id: 5,
      user: "user654@example.com",
      date: "2025-03-22",
      category: "Analysis",
      status: "Completed",
      message: "The vitamin D recommendations were very specific and helpful. Thank you!"
    }
  ];

  const filteredFeedback = activeTab === "all" 
    ? feedbackItems 
    : feedbackItems.filter(item => 
        activeTab === "new" 
          ? item.status === "New" 
          : activeTab === "in-progress" 
            ? item.status === "In Progress" 
            : item.status === "Completed"
      );

  return (
    <AdminRoute>
      <Layout
        homeHref="/admin"
        headerLeftExtra={
          <span className="px-2 py-1 rounded text-xs bg-secondary text-secondary-foreground">
            Admin Console
          </span>
        }
        headerRight={
          <>
            <Button variant="ghost" asChild>
              <Link href="/admin">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Back to App</Link>
            </Button>
          </>
        }
      >
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Feedback Management</h1>
          </div>

          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="all">All Feedback</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-6">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-medium mb-4">
                  {activeTab === "all" ? "All Feedback" : 
                   activeTab === "new" ? "New Feedback" : 
                   activeTab === "in-progress" ? "In Progress Feedback" : 
                   "Completed Feedback"}
                  <span className="ml-2 text-sm text-muted-foreground">({filteredFeedback.length} items)</span>
                </h3>
                
                <div className="space-y-4">
                  {filteredFeedback.length > 0 ? (
                    filteredFeedback.map((item) => (
                      <div key={item.id} className="p-4 rounded-md border border-border">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                          <div className="flex items-center gap-2 mb-2 md:mb-0">
                            <span className="font-medium">{item.user}</span>
                            <span className="text-xs text-muted-foreground">{item.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">
                              {item.category}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === "New" 
                                ? "bg-blue-500/20 text-blue-500" 
                                : item.status === "In Progress" 
                                  ? "bg-amber-500/20 text-amber-500" 
                                  : "bg-green-500/20 text-green-500"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{item.message}</p>
                        <div className="flex items-center gap-2">
                          {item.status === "New" && (
                            <>
                              <Button size="sm" variant="outline">Mark as In Progress</Button>
                              <Button size="sm" variant="outline">Mark as Completed</Button>
                            </>
                          )}
                          {item.status === "In Progress" && (
                            <Button size="sm" variant="outline">Mark as Completed</Button>
                          )}
                          <Button size="sm" variant="outline" className="ml-auto">Reply</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No feedback items found.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        </div>
      </Layout>
    </AdminRoute>
  );
}
