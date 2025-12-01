import prisma from '@/lib/prisma';

/**
 * Runner Profile Service
 * Handles runner profile data, registrations, results, and statistics
 */

export const runnerProfileService = {
  getRunnerByUserId,
  getRunnerRegistrations,
  getRunnerResults,
  getRunnerStats,
  linkRunnerToUser,
};

/**
 * Get runner profile by user ID
 */
async function getRunnerByUserId(userId: string) {
  return prisma.runner.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Get runner's registrations with event and run details
 */
async function getRunnerRegistrations(runnerId: string, filters?: {
  status?: 'upcoming' | 'past';
  limit?: number;
}) {
  const now = new Date();

  const where: any = {
    runnerId,
  };

  // Filter by upcoming or past events
  if (filters?.status === 'upcoming') {
    where.run = {
      event: {
        startDate: {
          gte: now,
        },
      },
    };
  } else if (filters?.status === 'past') {
    where.run = {
      event: {
        startDate: {
          lt: now,
        },
      },
    };
  }

  return prisma.registration.findMany({
    where,
    include: {
      run: {
        include: {
          event: {
            include: {
              location: {
                include: {
                  district: true,
                },
              },
            },
          },
        },
      },
      category: true,
      result: true,
    },
    orderBy: {
      registeredAt: 'desc',
    },
    take: filters?.limit,
  });
}

/**
 * Get runner's race results with detailed information
 */
async function getRunnerResults(runnerId: string, filters?: {
  limit?: number;
  resultStatus?: string;
}) {
  const where: any = {
    runnerId,
  };

  if (filters?.resultStatus) {
    where.resultStatus = filters.resultStatus;
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
      category: true,
      registration: {
        select: {
          registrationNumber: true,
          bibNumber: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: filters?.limit,
  });
}

/**
 * Calculate runner statistics
 */
async function getRunnerStats(runnerId: string) {
  // Get all results
  const results = await prisma.runResult.findMany({
    where: {
      runnerId,
      resultStatus: 'finished',
      finishTime: {
        not: null,
      },
    },
    include: {
      run: {
        select: {
          distance: true,
          name: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  // Calculate statistics
  const totalRaces = results.length;
  const totalDistance = results.reduce((sum, r) => sum + r.run.distance, 0);

  // Find personal records by distance
  const prsByDistance: Record<number, {
    time: number;
    pace: number;
    raceName: string;
    date: Date;
  }> = {};

  results.forEach((result) => {
    const distance = result.run.distance;
    const time = result.finishTime!;

    if (!prsByDistance[distance] || time < prsByDistance[distance].time) {
      prsByDistance[distance] = {
        time,
        pace: result.pace || 0,
        raceName: result.run.name,
        date: result.createdAt,
      };
    }
  });

  // Count finishes by year
  const finishesByYear: Record<number, number> = {};
  results.forEach((result) => {
    const year = result.createdAt.getFullYear();
    finishesByYear[year] = (finishesByYear[year] || 0) + 1;
  });

  // Count podium finishes (top 3 overall)
  const podiumFinishes = results.filter((r) => r.overallPlace && r.overallPlace <= 3).length;

  // Count category wins (1st place in category)
  const categoryWins = results.filter((r) => r.categoryPlace === 1).length;

  // Average pace
  const validPaces = results.filter((r) => r.pace).map((r) => r.pace!);
  const averagePace = validPaces.length > 0
    ? validPaces.reduce((sum, pace) => sum + pace, 0) / validPaces.length
    : 0;

  // Best overall placement
  const bestOverallPlace = results
    .filter((r) => r.overallPlace)
    .reduce((best, r) => {
      return !best || r.overallPlace! < best ? r.overallPlace! : best;
    }, null as number | null);

  return {
    totalRaces,
    totalDistance,
    personalRecords: prsByDistance,
    finishesByYear,
    podiumFinishes,
    categoryWins,
    averagePace,
    bestOverallPlace,
  };
}

/**
 * Link a runner profile to a user account
 */
async function linkRunnerToUser(runnerId: string, userId: string) {
  // Check if user already has a linked runner
  const existingRunner = await prisma.runner.findUnique({
    where: { userId },
  });

  if (existingRunner && existingRunner.id !== runnerId) {
    throw new Error('User already has a linked runner profile');
  }

  // Check if runner is already linked to another user
  const runner = await prisma.runner.findUnique({
    where: { id: runnerId },
  });

  if (runner?.userId && runner.userId !== userId) {
    throw new Error('Runner profile is already linked to another user');
  }

  // Link runner to user
  return prisma.runner.update({
    where: { id: runnerId },
    data: { userId },
  });
}
