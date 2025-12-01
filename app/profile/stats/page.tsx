import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Target, TrendingUp, Calendar, Award, Zap } from 'lucide-react';
import { getRunnerStats } from '@/actions/runner-profile.actions';

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

export default async function StatsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in?redirect=/profile/stats');
  }

  const statsResponse = await getRunnerStats();

  if (!statsResponse.success || !statsResponse.data) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div>
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Statistics</h1>
          <p className="text-muted-foreground mt-2">
            Your racing statistics and personal records
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No statistics available yet. Complete some races to see your stats!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = statsResponse.data;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to Profile
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground mt-2">
          Your racing statistics and personal records
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Total Races
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRaces}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Distance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalDistance.toFixed(1)} km</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Podium Finishes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.podiumFinishes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Category Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.categoryWins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Best Placement & Average Pace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Best Overall Placement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold">
              {stats.bestOverallPlace || '-'}
              {stats.bestOverallPlace && (
                <span className="text-2xl text-muted-foreground ml-2">
                  {stats.bestOverallPlace === 1 ? 'st' : stats.bestOverallPlace === 2 ? 'nd' : stats.bestOverallPlace === 3 ? 'rd' : 'th'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Average Pace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold font-mono">
              {stats.averagePace > 0 ? formatPace(stats.averagePace) : '-'}
            </div>
            {stats.averagePace > 0 && (
              <p className="text-sm text-muted-foreground mt-2">min/km</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Personal Records */}
      {Object.keys(stats.personalRecords).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Personal Records by Distance
            </CardTitle>
            <CardDescription>Your best times for each distance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.personalRecords)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([distance, record]: [string, any]) => (
                  <div
                    key={distance}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{distance}km</div>
                      </div>
                      <div className="h-10 w-px bg-border" />
                      <div>
                        <p className="font-medium">{record.raceName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString('sk-SK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono">
                        {formatTime(record.time)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPace(record.pace)} min/km
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Races by Year */}
      {Object.keys(stats.finishesByYear).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Races by Year
            </CardTitle>
            <CardDescription>Your racing activity over the years</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.finishesByYear)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([year, count]) => (
                  <div key={year} className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold">{count}</div>
                    <p className="text-sm text-muted-foreground mt-1">{year}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
