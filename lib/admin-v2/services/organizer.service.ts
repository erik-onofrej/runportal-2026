import prisma from '@/lib/prisma'
import type { Organizer, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const organizerService = {
  getAll,
  get,
  create,
  update,
  delete: deleteOrganizer,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<Organizer[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.OrganizerWhereInput = {}
  if (search?.query) {
    where.OR = [
      { name: { contains: search.query, mode: 'insensitive' } },
      { email: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.organizer.findMany({
      where,
      orderBy: orderBy || {'name':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.organizer.count({ where }),
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

async function get(id: number): Promise<Organizer | null> {
  return prisma.organizer.findUnique({
    where: { id },
  })
}

async function create(data: Prisma.OrganizerCreateInput): Promise<Organizer> {

  return prisma.organizer.create({
    data: {
      ...data,
    },
  })
}

async function update(id: number, data: Prisma.OrganizerUpdateInput): Promise<Organizer> {


  return prisma.organizer.update({
    where: { id },
    data: {
      ...data,
    },
  })
}

async function deleteOrganizer(ids: number[]): Promise<void> {
  await prisma.organizer.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.organizer.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}
