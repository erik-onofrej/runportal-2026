import { blogService } from '@/lib/services/blog.service'
import { BlogCard } from '@/components/public/blog-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Blog',
  description: 'Read our latest blog posts',
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const { blogs, pagination } = await blogService.getPublishedBlogs(page, 12)

  return (
    <div className="container px-4 py-12 mx-auto md:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">Blog</h1>
        <p className="text-xl text-muted-foreground">
          Explore our latest articles and stories
        </p>
      </div>

      {blogs.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No posts published yet.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {page > 1 && (
                <Button asChild variant="outline">
                  <Link href={`/blog?page=${page - 1}`}>Previous</Link>
                </Button>
              )}
              <span className="flex items-center px-4">
                Page {page} of {pagination.totalPages}
              </span>
              {page < pagination.totalPages && (
                <Button asChild variant="outline">
                  <Link href={`/blog?page=${page + 1}`}>Next</Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
