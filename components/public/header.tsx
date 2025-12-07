"use client"

import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserButton } from '@/components/auth/user-button'

export function Header() {
  const { data: session, isPending } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold">
          Starter Blog
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/events"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Events
          </Link>
          <Link
            href="/results"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Results
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Contact
          </Link>

          {isPending ? (
            <Skeleton className="h-10 w-24 rounded-md" />
          ) : session ? (
            <UserButton />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
