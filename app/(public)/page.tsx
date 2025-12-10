import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { blogService } from '@/lib/services/blog.service'
import { eventService } from '@/lib/services/event.service'
import { BlogCard } from '@/components/public/blog-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users } from 'lucide-react'

export default async function HomePage() {
  const recentBlogs = await blogService.getRecentBlogs(3)
  const { events: upcomingEvents } = await eventService.getUpcomingEvents({ limit: 6 })

  return (
    <div className="container px-4 py-12 mx-auto md:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-5xl font-bold">Welcome to Running Events</h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
          Discover upcoming running events and join the community.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/events">Browse Events</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/results">View Results</Link>
          </Button>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mb-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Upcoming Events</h2>
          <Button asChild variant="ghost">
            <Link href="/events">View All →</Link>
          </Button>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  {event.coverImage && (
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString('sk-SK', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {(event as any).location.city}
                        {(event as any).location.district && `, ${(event as any).location.district.name}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{(event as any).organizer.name}</span>
                    </div>

                    {(event as any).runs && (event as any).runs.length > 0 && (
                      <div className="pt-2">
                        <div className="text-sm font-medium mb-2">Races:</div>
                        <div className="flex flex-wrap gap-1">
                          {(event as any).runs.map((run: any) => (
                            <Badge key={run.id} variant="secondary">
                              {run.distance}km
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No upcoming events at the moment.</p>
        )}
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
