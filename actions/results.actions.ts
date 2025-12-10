'use server';

import { resultsService } from '@/lib/services/results.service';
import { eventService } from '@/lib/services/event.service';
import prisma from '@/lib/prisma';

/**
 * Public actions for viewing results
 */

/**
 * Get results for a specific run
 */
export async function getResultsByRun(runId: number) {
  try {
    const results = await resultsService.getResultsWithDetails(runId);

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch results',
    };
  }
}

/**
 * Get run details with event info
 */
export async function getRunWithEvent(runId: number) {
  try {
    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            endDate: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!run) {
      return {
        success: false,
        error: 'Run not found',
      };
    }

    return {
      success: true,
      data: run,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch run details',
    };
  }
}

/**
 * Search results across all events
 */
export async function searchResults(query: string, filters?: {
  eventId?: number;
  runId?: number;
  limit?: number;
}) {
  try {
    const results = await resultsService.searchResults(query, filters);

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search results',
    };
  }
}

/**
 * Get recent events with results
 */
export async function getEventsWithResults() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: 'completed',
        runs: {
          some: {
            results: {
              some: {},
            },
          },
        },
      },
      include: {
        runs: {
          include: {
            _count: {
              select: {
                results: true,
              },
            },
          },
          orderBy: { startTime: 'asc' },
        },
        location: {
          select: {
            city: true,
            district: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { startDate: 'desc' },
      take: 50,
    });

    return {
      success: true,
      data: events,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch events',
    };
  }
}

/**
 * Get results by event slug and run ID
 */
export async function getResultsByEventSlugAndRun(eventSlug: string, runId: number) {
  try {
    // Get event by slug
    const event = await prisma.event.findUnique({
      where: { slug: eventSlug },
      select: { id: true },
    });

    if (!event) {
      return {
        success: false,
        error: 'Event not found',
      };
    }

    // Verify run belongs to event
    const run = await prisma.run.findFirst({
      where: {
        id: runId,
        eventId: event.id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!run) {
      return {
        success: false,
        error: 'Run not found for this event',
      };
    }

    // Get results
    const results = await resultsService.getResultsWithDetails(runId);

    return {
      success: true,
      data: {
        run,
        results,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch results',
    };
  }
}
