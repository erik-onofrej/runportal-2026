import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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

export function RunCategoriesRenderer(value: unknown, row?: Record<string, unknown>) {
  const categories = row?.categories as Array<{ category: { name: string; code: string } }> | undefined

  if (!categories || categories.length === 0) {
    return <span className="text-muted-foreground text-sm">No categories</span>
  }

  // Show first 3 categories as badges, then a count if there are more
  const displayCategories = categories.slice(0, 3)
  const remainingCount = categories.length - 3

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {displayCategories.map((cat, index) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {cat.category.code}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-muted-foreground">+{remainingCount} more</span>
      )}
    </div>
  )
}
