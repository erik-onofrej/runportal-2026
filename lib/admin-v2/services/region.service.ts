import prisma from '@/lib/prisma'
import type { Region, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const regionService = {
  getAll,
  get,
  create,
  update,
  delete: deleteRegion,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<Region[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.RegionWhereInput = {}
  if (search?.query) {
    where.OR = [
      { name: { contains: search.query, mode: 'insensitive' } },
      { code: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.region.findMany({
      where,
      orderBy: orderBy || {'sortOrder':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.region.count({ where }),
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

async function get(id: number): Promise<Region | null> {
  return prisma.region.findUnique({
    where: { id },
  })
}

async function create(data: Prisma.RegionCreateInput): Promise<Region> {

  return prisma.region.create({
    data: {
      ...data,
    },
  })
}

async function update(id: number, data: Prisma.RegionUpdateInput): Promise<Region> {


  return prisma.region.update({
    where: { id },
    data: {
      ...data,
    },
  })
}

async function deleteRegion(ids: number[]): Promise<void> {
  await prisma.region.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.region.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}
