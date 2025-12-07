import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { blogService } from '@/lib/services/blog.service'
import { BlogCard } from '@/components/public/blog-card'

export default async function HomePage() {
  const recentBlogs = await blogService.getRecentBlogs(3)

  return (
    <div className="container px-4 py-12 mx-auto md:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-5xl font-bold">Welcome to Starter Blog</h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
          Discover amazing stories and connect with us.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/blog">Read Blog</Link>
          </Button>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <section className="mb-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Recent Posts</h2>
          <Button asChild variant="ghost">
            <Link href="/blog">View All →</Link>
          </Button>
        </div>
        {recentBlogs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {recentBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No blog posts yet.</p>
        )}
      </section>
    </div>
  )
}
