import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { getEventsWithResults } from '@/actions/results.actions';

export default async function ResultsBrowserPage() {
  const result = await getEventsWithResults();
  const events = result.success && result.data ? result.data : [];

  return (
    <div className="container mx-auto py-12 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Race Results</h1>
        <p className="text-xl text-muted-foreground">
          Browse and search results from completed races
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No results available yet. Check back after races are completed!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event: any) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-base">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.startDate).toLocaleDateString('sk-SK', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location.city}
                          {event.location.district && `, ${event.location.district.name}`}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">Available Results:</h3>
                  <div className="grid gap-2">
                    {event.runs.map((run: any) => {
                      const resultsCount = run._count?.results || 0;
                      if (resultsCount === 0) return null;

                      return (
                        <Link
                          key={run.id}
                          href={`/results/${event.slug}/${run.id}`}
                          className="block"
                        >
                          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium">{run.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {run.distance}km
                                  {run.elevationGain && ` • ${run.elevationGain}m elevation`}
                                  {run.surface && ` • ${run.surface}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{resultsCount} results</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                View Results
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
