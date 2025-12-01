'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, BarChart3, User } from 'lucide-react';

interface RunnerDashboardProps {
  runner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: Date;
    gender: string;
    city?: string | null;
    club?: string | null;
  };
  quickStats?: {
    upcomingRaces: number;
    completedRaces: number;
    totalDistance: number;
  };
}

export function RunnerDashboard({ runner, quickStats }: RunnerDashboardProps) {
  const age = new Date().getFullYear() - new Date(runner.dateOfBirth).getFullYear();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {runner.firstName} {runner.lastName}
              </CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-4 text-sm">
                  <span>{age} years old</span>
                  <span className="capitalize">{runner.gender}</span>
                  {runner.city && <span>{runner.city}</span>}
                </div>
              </CardDescription>
            </div>
            <Badge variant="secondary">
              <User className="mr-1 h-3 w-3" />
              Runner
            </Badge>
          </div>
        </CardHeader>
        {runner.club && (
          <CardContent>
            <div className="text-sm">
              <span className="text-muted-foreground">Club: </span>
              <span className="font-medium">{runner.club}</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Stats */}
      {quickStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Races
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{quickStats.upcomingRaces}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Races
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{quickStats.completedRaces}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Distance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{quickStats.totalDistance.toFixed(1)} km</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/profile/races">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">My Races</CardTitle>
                  <CardDescription>View your registrations</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/profile/results">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">My Results</CardTitle>
                  <CardDescription>View your race results</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/profile/stats">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                  <CardDescription>View your stats & PRs</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
