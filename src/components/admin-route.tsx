"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Admin access is determined via the isAdmin flag from the session
  const isAdmin = session?.user?.isAdmin;

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) {
      router.push("/login");
    } else if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [session, status, router, isAdmin]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
