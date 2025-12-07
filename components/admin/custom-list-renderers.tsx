import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function EventRunsLinkRenderer(value: unknown, row?: Record<string, unknown>) {
  const eventId = row?.id
  if (!eventId) return '-'

  return (
    <Link
      href={`/admin-v2/run?eventId=${eventId}`}
      className="flex items-center gap-1 text-primary hover:underline"
    >
      View Runs
      <ArrowRight className="h-3 w-3" />
    </Link>
  )
}

export function EventScheduleLinkRenderer(value: unknown, row?: Record<string, unknown>) {
  const eventId = row?.id
  if (!eventId) return '-'

  return (
    <Link
      href={`/admin-v2/eventschedule?eventId=${eventId}`}
      className="flex items-center gap-1 text-primary hover:underline"
    >
      View Schedule
      <ArrowRight className="h-3 w-3" />
    </Link>
  )
}

export function RunCategoriesLinkRenderer(value: unknown, row?: Record<string, unknown>) {
  const runId = row?.id
  if (!runId) return '-'

  return (
    <Link
      href={`/admin-v2/runcategory?runId=${runId}`}
      className="flex items-center gap-1 text-primary hover:underline"
    >
      View Categories
      <ArrowRight className="h-3 w-3" />
    </Link>
  )
}
