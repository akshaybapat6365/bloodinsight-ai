'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
      <h2 className="text-3xl font-bold">Page Not Found</h2>
      <p className="text-muted-foreground">Sorry, we couldn\'t find the page you were looking for.</p>
      <Link href="/dashboard" className="text-primary underline">
        Go back to Dashboard
      </Link>
    </div>
  )
}
