import { notFound } from 'next/navigation'
import { blogService } from '@/lib/services/blog.service'
import { formatDistance } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const blog = await blogService.getBlogBySlug(slug)

  if (!blog) {
    return {
      title: 'Blog Post Not Found',
    }
  }

  return {
    title: blog.title,
    description: blog.content.slice(0, 160),
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const blog = await blogService.getBlogBySlug(slug)

  if (!blog) {
    notFound()
  }

  return (
    <article className="container py-12">
      <div className="mx-auto max-w-3xl">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/blog">← Back to Blog</Link>
        </Button>

        {/* Post Header */}
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">{blog.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>By {blog.author.name}</span>
            <span>•</span>
            <span>
              {blog.publishedAt &&
                formatDistance(new Date(blog.publishedAt), new Date(), {
                  addSuffix: true,
                })}
            </span>
            <span>•</span>
            <span>{blog.views} views</span>
          </div>

          {/* Categories */}
          {blog.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {blog.categories.map(({ category }) => (
                <span
                  key={category.id}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: `${category.color}20`,
                    color: category.color,
                  }}
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Post Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap">{blog.content}</div>
        </div>
      </div>
    </article>
  )
}
