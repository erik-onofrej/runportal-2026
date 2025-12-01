import prisma from '@/lib/prisma';
import type { RunResult } from '@prisma/client';

/**
 * Results Service
 * Handles race results queries, calculations, and exports
 */

export const resultsService = {
  getResultsByRun,
  getResultsByRunner,
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
    categoryId?: number;
    resultStatus?: string;
    orderBy?: 'overallPlace' | 'categoryPlace' | 'finishTime';
    orderDirection?: 'asc' | 'desc';
  }
): Promise<RunResult[]> {
  const where: any = {
    runId,
  };

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters?.resultStatus) {
    where.resultStatus = filters.resultStatus;
  }

  const orderBy = filters?.orderBy || 'overallPlace';
  const orderDirection = filters?.orderDirection || 'asc';

  return prisma.runResult.findMany({
    where,
    include: {
      registration: {
        select: {
          guestFirstName: true,
          guestLastName: true,
          guestEmail: true,
          guestCity: true,
          guestClub: true,
          guestDateOfBirth: true,
          bibNumber: true,
        },
      },
      category: true,
      runner: {
        select: {
          firstName: true,
          lastName: true,
          club: true,
        },
      },
    },
    orderBy: {
      [orderBy]: orderDirection,
    },
  });
}

/**
 * Get all results for a specific runner
 */
async function getResultsByRunner(
  runnerId: string,
  filters?: {
    resultStatus?: string;
    limit?: number;
  }
): Promise<RunResult[]> {
  return prisma.runResult.findMany({
    where: {
      runnerId,
      ...(filters?.resultStatus && { resultStatus: filters.resultStatus }),
    },
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
      category: true,
      registration: {
        select: {
          bibNumber: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: filters?.limit || 100,
  });
}

/**
 * Search results by runner name or registration number
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
        registration: {
          guestFirstName: { contains: query, mode: 'insensitive' },
        },
      },
      {
        registration: {
          guestLastName: { contains: query, mode: 'insensitive' },
        },
      },
      {
        registration: {
          registrationNumber: { contains: query, mode: 'insensitive' },
        },
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
      registration: {
        select: {
          guestFirstName: true,
          guestLastName: true,
          registrationNumber: true,
          bibNumber: true,
        },
      },
      category: true,
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

  // Get all categories for this run
  const categories = await prisma.runCategory.findMany({
    where: {
      runId,
    },
  });

  // Update category placements
  for (const category of categories) {
    const categoryResults = await prisma.runResult.findMany({
      where: {
        runId,
        categoryId: category.id,
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
    city?: string | null;
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
    include: {
      registration: true,
      category: true,
      runner: true,
    },
    orderBy: {
      overallPlace: 'asc',
    },
  });

  return results.map((result) => ({
    place: result.overallPlace,
    categoryPlace: result.categoryPlace,
    firstName: result.registration.guestFirstName,
    lastName: result.registration.guestLastName,
    city: result.registration.guestCity,
    club: result.registration.guestClub || result.runner?.club,
    bibNumber: result.registration.bibNumber,
    category: result.category.name,
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
    'City',
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
      result.city || '',
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
