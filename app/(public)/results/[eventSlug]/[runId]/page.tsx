import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, Download } from 'lucide-react';
import { ResultsTable } from '@/components/public/results-table';
import { getResultsByEventSlugAndRun } from '@/actions/results.actions';

interface ResultsDetailPageProps {
  params: Promise<{
    eventSlug: string;
    runId: string;
  }>;
}

export default async function ResultsDetailPage({ params }: ResultsDetailPageProps) {
  const { eventSlug, runId } = await params;
  const result = await getResultsByEventSlugAndRun(eventSlug, parseInt(runId));

  if (!result.success || !result.data) {
    notFound();
  }

  const { run, results } = result.data;
  const event = run.event;

  return (
    <div className="container mx-auto py-12 space-y-8">
      {/* Back button */}
      <Link href="/results">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>
      </Link>

      {/* Event and Run Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">{event.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(event.startDate).toLocaleDateString('sk-SK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{run.name}</CardTitle>
                <CardDescription className="text-base mt-2">
                  <div className="flex items-center gap-4">
                    <span>{run.distance}km</span>
                    {run.elevationGain && <span>{run.elevationGain}m elevation gain</span>}
                    {run.surface && <span className="capitalize">{run.surface}</span>}
                  </div>
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {results.length} finishers
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Results Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{results.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Finished
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {results.filter((r) => r.status === 'finished').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Winner Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {results.find((r) => r.place === 1)?.finishTimeFormatted || '-'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{run.categories?.length || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      {results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No results available for this race yet.</p>
          </CardContent>
        </Card>
      ) : (
        <ResultsTable
          results={results}
          categories={run.categories}
          showCategoryFilter={run.categories && run.categories.length > 1}
        />
      )}

      {/* Download button */}
      {results.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" size="lg">
            <Download className="mr-2 h-4 w-4" />
            Download Results (CSV)
          </Button>
        </div>
      )}
    </div>
  );
}
