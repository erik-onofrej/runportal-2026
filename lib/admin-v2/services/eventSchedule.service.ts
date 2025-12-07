import prisma from '@/lib/prisma'
import type { EventSchedule, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const eventScheduleService = {
  getAll,
  get,
  create,
  update,
  delete: deleteEventSchedule,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<EventSchedule[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.EventScheduleWhereInput = {}
  if (search?.query) {
    where.OR = [
      { title: { contains: search.query, mode: 'insensitive' } },
      { description: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  // Handle eventId filter
  if (search?.filters?.eventId) {
    where.eventId = search.filters.eventId
  }

  const [data, total] = await Promise.all([
    prisma.eventSchedule.findMany({
      where,
      include: {
      event: true,
      },
      orderBy: orderBy || {'startTime':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.eventSchedule.count({ where }),
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

async function get(id: number): Promise<EventSchedule | null> {
  return prisma.eventSchedule.findUnique({
    where: { id },
      include: {
      event: true,
      },
  })
}

async function create(data: Prisma.EventScheduleCreateInput): Promise<EventSchedule> {

  return prisma.eventSchedule.create({
    data: {
      ...data,
    },
      include: {
      event: true,
      },
  })
}

async function update(id: number, data: Prisma.EventScheduleUpdateInput): Promise<EventSchedule> {


  return prisma.eventSchedule.update({
    where: { id },
    data: {
      ...data,
    },
      include: {
      event: true,
      },
  })
}

async function deleteEventSchedule(ids: number[]): Promise<void> {
  await prisma.eventSchedule.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.eventSchedule.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.title,
  }))
}
