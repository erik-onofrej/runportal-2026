import prisma from '@/lib/prisma'
import type { Location, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const locationService = {
  getAll,
  get,
  create,
  update,
  delete: deleteLocation,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<Location[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.LocationWhereInput = {}
  if (search?.query) {
    where.OR = [
      { name: { contains: search.query, mode: 'insensitive' } },
      { city: { contains: search.query, mode: 'insensitive' } },
      { street: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.location.findMany({
      where,
      include: {
      district: true,
      region: true,
      },
      orderBy: orderBy || {'name':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.location.count({ where }),
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

async function get(id: number): Promise<Location | null> {
  return prisma.location.findUnique({
    where: { id },
      include: {
      district: true,
      region: true,
      },
  })
}

async function create(data: Prisma.LocationCreateInput): Promise<Location> {

  return prisma.location.create({
    data: {
      ...data,
    },
      include: {
      district: true,
      region: true,
      },
  })
}

async function update(id: number, data: Prisma.LocationUpdateInput): Promise<Location> {


  return prisma.location.update({
    where: { id },
    data: {
      ...data,
    },
      include: {
      district: true,
      region: true,
      },
  })
}

async function deleteLocation(ids: number[]): Promise<void> {
  await prisma.location.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.location.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}
