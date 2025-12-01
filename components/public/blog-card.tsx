import Link from 'next/link'
import { formatDistance } from 'date-fns'

interface BlogCardProps {
  blog: {
    id: number
    title: string
    slug: string
    publishedAt: Date | null
  }
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
    >
      <div className="p-6">
        <h3 className="mb-2 text-xl font-semibold group-hover:text-primary">
          {blog.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {blog.publishedAt &&
            formatDistance(new Date(blog.publishedAt), new Date(), {
              addSuffix: true,
            })}
        </p>
      </div>
    </Link>
  )
}
