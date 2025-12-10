import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, ArrowRight, Trophy } from 'lucide-react';
import { getUserRegistrations } from '@/actions/profile.actions';

export default async function RacesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in?redirect=/profile/races');
  }

  // Fetch upcoming and past registrations
  const [upcomingResult, pastResult] = await Promise.all([
    getUserRegistrations({ status: 'upcoming' }),
    getUserRegistrations({ status: 'past' }),
  ]);

  const upcomingRaces = upcomingResult.success && upcomingResult.data ? upcomingResult.data : [];
  const pastRaces = pastResult.success && pastResult.data ? pastResult.data : [];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to Profile
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">My Races</h1>
        <p className="text-muted-foreground mt-2">
          View your race registrations and participation history
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingRaces.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastRaces.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Races */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingRaces.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  You don't have any upcoming race registrations
                </p>
                <Link href="/events">
                  <Button>Browse Events</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            upcomingRaces.map((registration: any) => (
              <Card key={registration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">
                        {registration.run.event.title}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(registration.run.event.startDate).toLocaleDateString('sk-SK', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          {registration.run.event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {registration.run.event.location.city}
                              {registration.run.event.location.district &&
                                `, ${registration.run.event.location.district.name}`
                              }
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <Badge variant={registration.status === 'confirmed' ? 'default' : 'secondary'}>
                      {registration.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Race</p>
                      <p className="font-medium">{registration.run.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Distance</p>
                      <p className="font-medium">{registration.run.distance}km</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{registration.category.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Registration #</p>
                      <p className="font-mono text-xs">{registration.registrationNumber}</p>
                    </div>
                  </div>

                  {registration.bibNumber && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Bib Number</p>
                      <p className="text-2xl font-bold">{registration.bibNumber}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/events/${registration.run.event.slug}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Event Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Past Races */}
        <TabsContent value="past" className="space-y-4">
          {pastRaces.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No past race registrations</p>
              </CardContent>
            </Card>
          ) : (
            pastRaces.map((registration: any) => (
              <Card key={registration.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">
                        {registration.run.event.title}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(registration.run.event.startDate).toLocaleDateString('sk-SK', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    {registration.result && (
                      <Badge variant="default">
                        <Trophy className="mr-1 h-3 w-3" />
                        Has Result
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Race</p>
                      <p className="font-medium">{registration.run.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Distance</p>
                      <p className="font-medium">{registration.run.distance}km</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{registration.category.name}</p>
                    </div>
                    {registration.result && (
                      <div>
                        <p className="text-muted-foreground">Place</p>
                        <p className="font-medium">
                          {registration.result.overallPlace || '-'}
                          {registration.result.categoryPlace &&
                            ` (${registration.result.categoryPlace} in category)`
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  {registration.result && (
                    <Link href={`/results/${registration.run.event.slug}/${registration.run.id}`}>
                      <Button variant="outline" className="w-full">
                        View Full Results
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
