import prisma from '@/lib/prisma';
import type { Event, Run } from '@prisma/client';

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
            orderBy: {
              sortOrder: 'asc',
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
            orderBy: {
              sortOrder: 'asc',
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
  limit?: number;
  offset?: number;
}): Promise<{ events: Event[]; total: number }> {
  const { limit = 10, offset = 0, ...whereFilters } = filters;

  const where: any = {
    status: whereFilters.status || 'published',
  };

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
