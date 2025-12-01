'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CSVImportWizard } from '@/components/admin/csv-import-wizard';
import { getAllEvents } from '@/actions/v2/event.actions';
import { getAllRuns } from '@/actions/v2/run.actions';

export default function ResultsImportPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Load runs when event is selected
  useEffect(() => {
    if (selectedEventId) {
      loadRuns(parseInt(selectedEventId));
    } else {
      setRuns([]);
      setSelectedRunId('');
      setSelectedRun(null);
    }
  }, [selectedEventId]);

  // Update selected run details
  useEffect(() => {
    if (selectedRunId) {
      const run = runs.find((r) => r.id === parseInt(selectedRunId));
      setSelectedRun(run || null);
    } else {
      setSelectedRun(null);
    }
  }, [selectedRunId, runs]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const result = await getAllEvents({
        pagination: {
          page: 1,
          pageSize: 1000,
        },
        orderBy: {
          startDate: 'desc',
        },
      });

      if (result.success && result.data) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRuns = async (eventId: number) => {
    try {
      const result = await getAllRuns({
        pagination: {
          page: 1,
          pageSize: 1000,
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      if (result.success && result.data) {
        // Filter runs by event
        const eventRuns = result.data.filter((run: any) => run.eventId === eventId);
        setRuns(eventRuns);
      }
    } catch (error) {
      console.error('Failed to load runs:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Race Results</h1>
        <p className="text-muted-foreground">
          Upload and import race results from a CSV file
        </p>
      </div>

      {/* Event and Run Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Event and Run</CardTitle>
          <CardDescription>
            Choose the event and specific run to import results for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event</label>
              <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.title} ({new Date(event.startDate).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Run</label>
              <Select
                value={selectedRunId}
                onValueChange={setSelectedRunId}
                disabled={!selectedEventId || runs.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a run" />
                </SelectTrigger>
                <SelectContent>
                  {runs.map((run) => (
                    <SelectItem key={run.id} value={run.id.toString()}>
                      {run.name} - {run.distance}km
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEventId && runs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No runs found for this event. Please create runs first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* CSV Import Wizard */}
      {selectedRun && (
        <CSVImportWizard
          runId={selectedRun.id}
          runName={`${selectedRun.name} (${selectedRun.distance}km)`}
        />
      )}

      {!selectedRun && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Please select an event and run to begin importing results
          </CardContent>
        </Card>
      )}
    </div>
  );
}
