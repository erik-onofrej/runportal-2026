import { eventService } from '@/lib/services/event.service';
import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EventsFilter } from '@/components/events/events-filter';

export const metadata = {
  title: 'Upcoming Events',
  description: 'Browse upcoming running events',
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    regionId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    minDistance?: string;
    maxDistance?: string;
    minElevation?: string;
    maxElevation?: string;
    surface?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  // Parse filter parameters
  const regionId = params.regionId ? Number(params.regionId) : undefined;
  const search = params.search || undefined;
  const minDistance = params.minDistance ? Number(params.minDistance) : undefined;
  const maxDistance = params.maxDistance ? Number(params.maxDistance) : undefined;
  const minElevation = params.minElevation ? Number(params.minElevation) : undefined;
  const maxElevation = params.maxElevation ? Number(params.maxElevation) : undefined;
  const surface = params.surface || undefined;

  // Parse dates
  const startDateFrom = params.startDate ? new Date(params.startDate) : new Date(); // Default to today for upcoming events
  const startDateTo = params.endDate ? new Date(params.endDate) : undefined;

  // Fetch filter options
  const regions = await eventService.getRegionOptions();

  // Fetch events with filters
  const { events, total } = await eventService.getEventsByFilters({
    regionId,
    search,
    startDateFrom,
    startDateTo,
    minDistance,
    maxDistance,
    minElevation,
    maxElevation,
    surface,
    limit,
    offset,
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Upcoming Events</h1>
        <p className="text-muted-foreground">
          Find and register for running events across Slovakia
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Left Sidebar - Filters */}
        <aside className="lg:block">
          <div className="lg:sticky lg:top-4">
            <EventsFilter regions={regions} />
          </div>
        </aside>

        {/* Main Content - Events */}
        <div className="min-w-0">
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No upcoming events found.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {events.map((event) => (
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

              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/events?${new URLSearchParams({
                        ...params,
                        page: (page - 1).toString()
                      }).toString()}`}
                      className="px-4 py-2 border rounded-md hover:bg-accent"
                    >
                      Previous
                    </Link>
                  )}
                  <div className="px-4 py-2 border rounded-md bg-accent">
                    Page {page} of {totalPages}
                  </div>
                  {page < totalPages && (
                    <Link
                      href={`/events?${new URLSearchParams({
                        ...params,
                        page: (page + 1).toString()
                      }).toString()}`}
                      className="px-4 py-2 border rounded-md hover:bg-accent"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
