"use client";

import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">BloodInsight AI</span>
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign Out
              </Button>
            </nav>
          </div>
        </header>

        <main className="flex-1 container py-8">
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
        </main>

        <footer className="border-t border-border py-6 bg-background">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 BloodInsight AI. For educational purposes only.
            </p>
            <p className="text-sm text-muted-foreground">
              Not intended to replace medical advice.
            </p>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
