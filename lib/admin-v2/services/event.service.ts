import prisma from '@/lib/prisma'
import type { Event, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const eventService = {
  getAll,
  get,
  create,
  update,
  delete: deleteEvent,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<Event[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.EventWhereInput = {}
  if (search?.query) {
    where.OR = [
      { title: { contains: search.query, mode: 'insensitive' } },
      { slug: { contains: search.query, mode: 'insensitive' } },
      { description: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
      location: true,
      organizer: true,
      galleries: {
        include: {
          gallery: true,
        },
      },
      },
      orderBy: orderBy || {'startDate':'desc'},
      skip,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ])

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

async function get(id: number): Promise<Event | null> {
  return prisma.event.findUnique({
    where: { id },
      include: {
      location: true,
      organizer: true,
      galleries: {
        include: {
          gallery: true,
        },
      },
      },
  })
}

async function create(data: Prisma.EventCreateInput): Promise<Event> {
  const { galleries, ...restData } = data

  return prisma.event.create({
    data: {
      ...restData,
      galleries: Array.isArray(galleries)
        ? {
            create: (galleries as number[]).map((galleryId: number) => ({
              galleryId: galleryId,
            })),
          }
        : undefined,
    },
      include: {
      location: true,
      organizer: true,
      galleries: {
        include: {
          gallery: true,
        },
      },
      },
  })
}

async function update(id: number, data: Prisma.EventUpdateInput): Promise<Event> {
  const { galleries, ...restData } = data

  if (galleries !== undefined) {
    await prisma.eventGallery.deleteMany({
      where: { eventId: id },
    })
  }


  return prisma.event.update({
    where: { id },
    data: {
      ...restData,
      galleries: Array.isArray(galleries)
        ? {
            create: (galleries as number[]).map((galleryId: number) => ({
              galleryId: galleryId,
            })),
          }
        : undefined,
    },
      include: {
      location: true,
      organizer: true,
      galleries: {
        include: {
          gallery: true,
        },
      },
      },
  })
}

async function deleteEvent(ids: number[]): Promise<void> {
  await prisma.event.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.event.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.title,
  }))
}
