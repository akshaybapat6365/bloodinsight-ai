"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  headerRight?: ReactNode;
  headerLeftExtra?: ReactNode;
  homeHref?: string;
}

export default function Layout({
  children,
  headerRight,
  headerLeftExtra,
  homeHref = "/",
}: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={homeHref} className="text-xl font-bold text-primary">
              BloodInsight AI
            </Link>
            {headerLeftExtra}
          </div>
          <nav className="flex items-center gap-4">{headerRight}</nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
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
  );
}
