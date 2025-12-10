import prisma from '@/lib/prisma';
import type { RunResult } from '@prisma/client';

/**
 * Results Service
 * Handles race results queries, calculations, and exports
 */

export const resultsService = {
  getResultsByRun,
  searchResults,
  calculatePlacements,
  exportResults,
  getResultsWithDetails,
};

/**
 * Get all results for a run with filtering and sorting
 */
async function getResultsByRun(
  runId: number,
  filters?: {
    category?: string;
    resultStatus?: string;
    orderBy?: 'overallPlace' | 'categoryPlace' | 'finishTime';
    orderDirection?: 'asc' | 'desc';
  }
): Promise<RunResult[]> {
  const where: any = {
    runId,
  };

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.resultStatus) {
    where.resultStatus = filters.resultStatus;
  }

  const orderBy = filters?.orderBy || 'overallPlace';
  const orderDirection = filters?.orderDirection || 'asc';

  return prisma.runResult.findMany({
    where,
    orderBy: {
      [orderBy]: orderDirection,
    },
  });
}

/**
 * Search results by runner name
 */
async function searchResults(
  query: string,
  filters?: {
    eventId?: number;
    runId?: number;
    limit?: number;
  }
): Promise<RunResult[]> {
  const where: any = {
    OR: [
      {
        firstName: { contains: query, mode: 'insensitive' },
      },
      {
        lastName: { contains: query, mode: 'insensitive' },
      },
      {
        bibNumber: { contains: query, mode: 'insensitive' },
      },
    ],
  };

  if (filters?.runId) {
    where.runId = filters.runId;
  } else if (filters?.eventId) {
    where.run = {
      eventId: filters.eventId,
    };
  }

  return prisma.runResult.findMany({
    where,
    include: {
      run: {
        include: {
          event: {
            select: {
              title: true,
              slug: true,
              startDate: true,
            },
          },
        },
      },
    },
    orderBy: {
      overallPlace: 'asc',
    },
    take: filters?.limit || 50,
  });
}

/**
 * Calculate and update placements for a run
 * This should be called after importing results
 */
async function calculatePlacements(runId: number): Promise<void> {
  // Get all finished results ordered by finish time
  const finishedResults = await prisma.runResult.findMany({
    where: {
      runId,
      resultStatus: 'finished',
      finishTime: { not: null },
    },
    orderBy: {
      finishTime: 'asc',
    },
  });

  // Update overall placements
  for (let i = 0; i < finishedResults.length; i++) {
    await prisma.runResult.update({
      where: { id: finishedResults[i].id },
      data: { overallPlace: i + 1 },
    });
  }

  // Get all unique categories for this run from results
  const uniqueCategories = await prisma.runResult.findMany({
    where: { runId },
    select: { category: true },
    distinct: ['category'],
  });

  // Update category placements
  for (const { category } of uniqueCategories) {
    const categoryResults = await prisma.runResult.findMany({
      where: {
        runId,
        category,
        resultStatus: 'finished',
        finishTime: { not: null },
      },
      orderBy: {
        finishTime: 'asc',
      },
    });

    for (let i = 0; i < categoryResults.length; i++) {
      await prisma.runResult.update({
        where: { id: categoryResults[i].id },
        data: { categoryPlace: i + 1 },
      });
    }
  }
}

/**
 * Get results with full details for display
 */
async function getResultsWithDetails(runId: number): Promise<
  Array<{
    place: number | null;
    categoryPlace: number | null;
    firstName: string;
    lastName: string;
    club?: string | null;
    bibNumber?: string | null;
    category: string;
    finishTime: number | null;
    finishTimeFormatted: string | null;
    pace: number | null;
    paceFormatted: string | null;
    status: string;
  }>
> {
  const results = await prisma.runResult.findMany({
    where: { runId },
    orderBy: {
      overallPlace: 'asc',
    },
  });

  return results.map((result) => ({
    place: result.overallPlace,
    categoryPlace: result.categoryPlace,
    firstName: result.firstName,
    lastName: result.lastName,
    club: result.club,
    bibNumber: result.bibNumber,
    category: result.category,
    finishTime: result.finishTime,
    finishTimeFormatted: result.finishTime
      ? formatTime(result.finishTime)
      : null,
    pace: result.pace,
    paceFormatted: result.pace ? formatPace(result.pace) : null,
    status: result.resultStatus,
  }));
}

/**
 * Export results to CSV format
 */
async function exportResults(runId: number): Promise<string> {
  const results = await getResultsWithDetails(runId);

  // CSV header
  const header = [
    'Overall Place',
    'Category Place',
    'First Name',
    'Last Name',
    'Club',
    'Bib Number',
    'Category',
    'Finish Time',
    'Pace',
    'Status',
  ].join(',');

  // CSV rows
  const rows = results.map((result) =>
    [
      result.place || '',
      result.categoryPlace || '',
      result.firstName,
      result.lastName,
      result.club || '',
      result.bibNumber || '',
      result.category,
      result.finishTimeFormatted || '',
      result.paceFormatted || '',
      result.status,
    ].join(',')
  );

  return [header, ...rows].join('\n');
}

/**
 * Format seconds to HH:MM:SS
 */
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

/**
 * Format pace to MM:SS per km
 */
function formatPace(paceMinPerKm: number): string {
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
