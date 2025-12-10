import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, Clock, Target, ArrowRight } from 'lucide-react';
import { getUserResults } from '@/actions/profile.actions';

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');
}

function formatPace(paceMinPerKm: number): string {
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default async function ResultsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in?redirect=/profile/results');
  }

  const resultsResponse = await getUserResults();
  const results = resultsResponse.success && resultsResponse.data ? resultsResponse.data : [];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to Profile
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">My Results</h1>
        <p className="text-muted-foreground mt-2">
          Your race results and performance history
        </p>
      </div>

      {results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              You don't have any race results yet
            </p>
            <p className="text-sm text-muted-foreground">
              Results will appear here after you complete a race
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((result: any) => (
            <Card key={result.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">
                      {result.run.event.title} - {result.run.name}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(result.run.event.startDate).toLocaleDateString('sk-SK', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <span>{result.run.distance}km</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge variant={result.overallPlace <= 3 ? 'default' : 'secondary'}>
                    {result.resultStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Overall Place */}
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Trophy className="mx-auto h-5 w-5 text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">
                      {result.overallPlace || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Overall</p>
                  </div>

                  {/* Category Place */}
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Target className="mx-auto h-5 w-5 text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">
                      {result.categoryPlace || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{result.category.name}</p>
                  </div>

                  {/* Finish Time */}
                  {result.finishTime && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Clock className="mx-auto h-5 w-5 text-muted-foreground mb-2" />
                      <p className="text-xl font-bold font-mono">
                        {formatTime(result.finishTime)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Finish Time</p>
                    </div>
                  )}

                  {/* Pace */}
                  {result.pace && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-xl font-bold font-mono">
                        {formatPace(result.pace)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">min/km</p>
                    </div>
                  )}

                  {/* Bib Number */}
                  {result.registration.bibNumber && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-xl font-bold">
                        {result.registration.bibNumber}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Bib #</p>
                    </div>
                  )}
                </div>

                {/* Podium Highlight */}
                {result.overallPlace <= 3 && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Podium Finish - {result.overallPlace}
                      {result.overallPlace === 1 ? 'st' : result.overallPlace === 2 ? 'nd' : 'rd'} Place Overall!
                    </p>
                  </div>
                )}

                {/* Category Win */}
                {result.categoryPlace === 1 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Category Winner - {result.category.name}
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <Link href={`/results/${result.run.event.slug}/${result.run.id}`}>
                    <Button variant="outline" className="w-full">
                      View Full Results
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
