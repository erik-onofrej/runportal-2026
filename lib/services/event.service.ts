import prisma from '@/lib/prisma';
import type { Event, Run } from '@prisma/client';
import { regionService } from '@/lib/admin-v2/services/region.service';
import { organizerService } from '@/lib/admin-v2/services/organizer.service';

/**
 * Event Service
 * Handles public event queries and searches
 */

export const eventService = {
  getUpcomingEvents,
  getEventBySlug,
  getEventWithFullDetails,
  searchEvents,
  getEventsByFilters,
  getRegionOptions,
  getOrganizerOptions,
};

/**
 * Get upcoming published events
 */
async function getUpcomingEvents(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ events: Event[]; total: number }> {
  const { limit = 10, offset = 0 } = params || {};

  const now = new Date();

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: {
        status: 'published',
        startDate: {
          gte: now,
        },
      },
      include: {
        location: {
          include: {
            district: true,
            region: true,
          },
        },
        organizer: true,
        runs: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      skip: offset,
      take: limit,
    }),
    prisma.event.count({
      where: {
        status: 'published',
        startDate: {
          gte: now,
        },
      },
    }),
  ]);

  return { events, total };
}

/**
 * Get event by slug (for public event detail pages)
 */
async function getEventBySlug(slug: string): Promise<Event | null> {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      location: {
        include: {
          district: true,
          region: true,
        },
      },
      organizer: true,
      runs: {
        include: {
          categories: {
            include: {
              category: true,
            },
            orderBy: {
              category: {
                sortOrder: 'asc',
              },
            },
          },
          entryFees: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      schedule: {
        orderBy: {
          startTime: 'asc',
        },
      },
      partners: {
        include: {
          partner: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      attachments: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });
}

/**
 * Get event with all details (including registration counts, etc.)
 */
async function getEventWithFullDetails(eventId: number): Promise<
  | (Event & {
      registrationCounts?: {
        runId: number;
        runName: string;
        total: number;
        paid: number;
        confirmed: number;
      }[];
    })
  | null
> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      location: {
        include: {
          district: true,
          region: true,
        },
      },
      organizer: true,
      runs: {
        include: {
          categories: {
            include: {
              category: true,
            },
            orderBy: {
              category: {
                sortOrder: 'asc',
              },
            },
          },
          entryFees: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
          registrations: {
            select: {
              id: true,
              paid: true,
              status: true,
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      schedule: {
        orderBy: {
          startTime: 'asc',
        },
      },
      partners: {
        include: {
          partner: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      attachments: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });

  if (!event) {
    return null;
  }

  // Calculate registration counts
  const registrationCounts = event.runs.map((run) => ({
    runId: run.id,
    runName: run.name,
    total: run.registrations.length,
    paid: run.registrations.filter((r) => r.paid).length,
    confirmed: run.registrations.filter((r) => r.status === 'confirmed').length,
  }));

  return {
    ...event,
    registrationCounts,
  };
}

/**
 * Search events by query string
 */
async function searchEvents(
  query: string,
  params?: {
    limit?: number;
    offset?: number;
  }
): Promise<{ events: Event[]; total: number }> {
  const { limit = 10, offset = 0 } = params || {};

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: {
        status: 'published',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          {
            location: {
              city: { contains: query, mode: 'insensitive' },
            },
          },
          {
            organizer: {
              name: { contains: query, mode: 'insensitive' },
            },
          },
        ],
      },
      include: {
        location: {
          include: {
            district: true,
            region: true,
          },
        },
        organizer: true,
        runs: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      skip: offset,
      take: limit,
    }),
    prisma.event.count({
      where: {
        status: 'published',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          {
            location: {
              city: { contains: query, mode: 'insensitive' },
            },
          },
          {
            organizer: {
              name: { contains: query, mode: 'insensitive' },
            },
          },
        ],
      },
    }),
  ]);

  return { events, total };
}

/**
 * Get events by filters
 */
async function getEventsByFilters(filters: {
  regionId?: number;
  districtId?: number;
  organizerId?: number;
  startDateFrom?: Date;
  startDateTo?: Date;
  status?: string;
  search?: string;
  minDistance?: number;
  maxDistance?: number;
  minElevation?: number;
  maxElevation?: number;
  surface?: string;
  limit?: number;
  offset?: number;
}): Promise<{ events: Event[]; total: number }> {
  const { limit = 10, offset = 0, ...whereFilters } = filters;

  const where: any = {
    status: whereFilters.status || 'published',
  };

  // Search by event title or description
  if (whereFilters.search) {
    where.OR = [
      { title: { contains: whereFilters.search, mode: 'insensitive' } },
      { description: { contains: whereFilters.search, mode: 'insensitive' } },
    ];
  }

  if (whereFilters.organizerId) {
    where.organizerId = whereFilters.organizerId;
  }

  if (whereFilters.regionId) {
    where.location = {
      ...where.location,
      regionId: whereFilters.regionId,
    };
  }

  if (whereFilters.districtId) {
    where.location = {
      ...where.location,
      districtId: whereFilters.districtId,
    };
  }

  if (whereFilters.startDateFrom || whereFilters.startDateTo) {
    where.startDate = {};
    if (whereFilters.startDateFrom) {
      where.startDate.gte = whereFilters.startDateFrom;
    }
    if (whereFilters.startDateTo) {
      where.startDate.lte = whereFilters.startDateTo;
    }
  }

  // Filter by run properties (distance, elevation, surface)
  const runFilters: any = {};

  if (whereFilters.minDistance !== undefined || whereFilters.maxDistance !== undefined) {
    runFilters.distance = {};
    if (whereFilters.minDistance !== undefined) {
      runFilters.distance.gte = whereFilters.minDistance;
    }
    if (whereFilters.maxDistance !== undefined) {
      runFilters.distance.lte = whereFilters.maxDistance;
    }
  }

  if (whereFilters.minElevation !== undefined || whereFilters.maxElevation !== undefined) {
    runFilters.elevationGain = {};
    if (whereFilters.minElevation !== undefined) {
      runFilters.elevationGain.gte = whereFilters.minElevation;
    }
    if (whereFilters.maxElevation !== undefined) {
      runFilters.elevationGain.lte = whereFilters.maxElevation;
    }
  }

  if (whereFilters.surface) {
    runFilters.surface = {
      contains: whereFilters.surface,
      mode: 'insensitive',
    };
  }

  // Only add runs filter if there are run-specific filters
  if (Object.keys(runFilters).length > 0) {
    where.runs = {
      some: runFilters,
    };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        location: {
          include: {
            district: true,
            region: true,
          },
        },
        organizer: true,
        runs: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      skip: offset,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total };
}

/**
 * Get region options for filters
 */
async function getRegionOptions(): Promise<Array<{ value: number; label: string }>> {
  return regionService.getOptions();
}

/**
 * Get organizer options for filters
 */
async function getOrganizerOptions(): Promise<Array<{ value: number; label: string }>> {
  return organizerService.getOptions();
}
