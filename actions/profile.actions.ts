'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * Profile Actions
 * Server actions for user profile and registration history
 */

/**
 * Get user's registrations
 */
export async function getUserRegistrations(params?: {
  status?: 'upcoming' | 'past' | 'all';
  limit?: number;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const { status = 'all', limit } = params || {};
    const now = new Date();

    const where: any = {
      email: session.user.email,
    };

    // Filter by status
    if (status === 'upcoming') {
      where.run = {
        startTime: { gte: now },
      };
    } else if (status === 'past') {
      where.run = {
        startTime: { lt: now },
      };
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        run: {
          include: {
            event: {
              include: {
                location: true,
                organizer: true,
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
      ...(limit && { take: limit }),
    });

    return {
      success: true,
      data: registrations,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get registrations',
    };
  }
}

/**
 * Get user's statistics based on their registrations and results
 */
export async function getUserStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Get all registrations with results
    const registrations = await prisma.registration.findMany({
      where: {
        email: session.user.email,
      },
      include: {
        run: true,
        result: true,
      },
    });

    // Calculate stats
    const totalRaces = registrations.length;
    const completedRaces = registrations.filter((r) => r.result).length;
    const upcomingRaces = registrations.filter(
      (r) => r.run.startTime > new Date() && !r.result
    ).length;

    // Calculate total distance from completed races
    const totalDistance = registrations
      .filter((r) => r.result && r.result.resultStatus === 'finished')
      .reduce((sum, r) => sum + r.run.distance, 0);

    // Best times by distance
    const bestTimes: Record<number, number> = {};
    registrations.forEach((r) => {
      if (r.result && r.result.finishTime && r.result.resultStatus === 'finished') {
        const distance = r.run.distance;
        if (!bestTimes[distance] || r.result.finishTime < bestTimes[distance]) {
          bestTimes[distance] = r.result.finishTime;
        }
      }
    });

    // Calculate podium finishes (top 3 overall)
    const podiumFinishes = registrations.filter(
      (r) => r.result && r.result.overallPlace && r.result.overallPlace <= 3
    ).length;

    // Calculate category wins
    const categoryWins = registrations.filter(
      (r) => r.result && r.result.categoryPlace === 1
    ).length;

    // Best overall place
    const bestOverallPlace = registrations
      .filter((r) => r.result && r.result.overallPlace)
      .reduce((best, r) => {
        const place = r.result!.overallPlace!;
        return !best || place < best ? place : best;
      }, null as number | null);

    return {
      success: true,
      data: {
        totalRaces,
        completedRaces,
        upcomingRaces,
        totalDistance,
        bestTimes,
        podiumFinishes,
        categoryWins,
        bestOverallPlace,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats',
    };
  }
}

/**
 * Get user's race results
 */
export async function getUserResults() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Get all registrations with results
    const registrations = await prisma.registration.findMany({
      where: {
        email: session.user.email,
        result: {
          isNot: null,
        },
      },
      include: {
        run: {
          include: {
            event: {
              include: {
                location: true,
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
    });

    return {
      success: true,
      data: registrations,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get results',
    };
  }
}

/**
 * Get user's profile data from their last registration
 */
export async function getUserProfileData() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Get last registration to get profile data
    const lastRegistration = await prisma.registration.findFirst({
      where: {
        email: session.user.email,
      },
      orderBy: {
        registeredAt: 'desc',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        city: true,
        club: true,
      },
    });

    // Transform id to string to match expected runner type
    const profileData = lastRegistration ? {
      ...lastRegistration,
      id: lastRegistration.id.toString(),
    } : null;

    return {
      success: true,
      data: profileData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get profile data',
    };
  }
}
