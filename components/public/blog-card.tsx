import Link from 'next/link'
import Image from 'next/image'
import { formatDistance } from 'date-fns'
import { FileText } from 'lucide-react'

interface BlogCardProps {
  blog: {
    id: number
    title: string
    slug: string
    excerpt?: string | null
    thumbnailUrl?: string | null
    publishedAt: Date | null
  }
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
    >
      {/* Thumbnail */}
      {blog.thumbnailUrl ? (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={blog.thumbnailUrl}
            alt={blog.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="relative aspect-video w-full bg-muted flex items-center justify-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <h3 className="mb-2 text-xl font-semibold group-hover:text-primary line-clamp-2">
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-3">
            {blog.excerpt}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          {blog.publishedAt &&
            formatDistance(new Date(blog.publishedAt), new Date(), {
              addSuffix: true,
            })}
        </p>
      </div>
    </Link>
  )
}
