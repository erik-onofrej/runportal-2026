'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { runnerProfileService } from '@/lib/services/runner-profile.service';

/**
 * Server actions for runner profile pages
 */

/**
 * Get current runner profile for logged-in user
 */
export async function getCurrentRunnerProfile() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const runner = await runnerProfileService.getRunnerByUserId(session.user.id);

    if (!runner) {
      return {
        success: false,
        error: 'No runner profile found. Register for a race to create your profile.',
      };
    }

    return {
      success: true,
      data: runner,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch runner profile',
    };
  }
}

/**
 * Get runner's registrations
 */
export async function getRunnerRegistrations(filters?: {
  status?: 'upcoming' | 'past';
  limit?: number;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const runner = await runnerProfileService.getRunnerByUserId(session.user.id);

    if (!runner) {
      return {
        success: false,
        error: 'No runner profile found',
      };
    }

    const registrations = await runnerProfileService.getRunnerRegistrations(
      runner.id,
      filters
    );

    return {
      success: true,
      data: registrations,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch registrations',
    };
  }
}

/**
 * Get runner's results
 */
export async function getRunnerResults(filters?: {
  limit?: number;
  resultStatus?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const runner = await runnerProfileService.getRunnerByUserId(session.user.id);

    if (!runner) {
      return {
        success: false,
        error: 'No runner profile found',
      };
    }

    const results = await runnerProfileService.getRunnerResults(runner.id, filters);

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
 * Get runner's statistics
 */
export async function getRunnerStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const runner = await runnerProfileService.getRunnerByUserId(session.user.id);

    if (!runner) {
      return {
        success: false,
        error: 'No runner profile found',
      };
    }

    const stats = await runnerProfileService.getRunnerStats(runner.id);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
    };
  }
}
