"use client";

import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <ProtectedRoute>
      <Layout
        homeHref="/dashboard"
        headerRight={
          <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign Out
          </Button>
        }
      >
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Welcome, {session?.user?.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
              <p className="text-muted-foreground mb-4">
                Upload your lab reports to get AI-powered analysis and easy-to-understand explanations.
              </p>
              <Button asChild>
                <Link href="/upload">Upload Documents</Link>
              </Button>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">View Trends</h2>
              <p className="text-muted-foreground mb-4">
                Track how your health metrics change over time with our trends analysis feature.
              </p>
              <Button asChild variant="outline">
                <Link href="/trends">View Trends</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-lg border border-border bg-card">
            <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                You haven't uploaded any reports yet. Get started by uploading your first lab report.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/upload">Upload Your First Report</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
