import prisma from '@/lib/prisma'
import type { District, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const districtService = {
  getAll,
  get,
  create,
  update,
  delete: deleteDistrict,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<District[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.DistrictWhereInput = {}
  if (search?.query) {
    where.OR = [
      { name: { contains: search.query, mode: 'insensitive' } },
      { code: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.district.findMany({
      where,
      include: {
      region: true,
      },
      orderBy: orderBy || {'sortOrder':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.district.count({ where }),
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

async function get(id: number): Promise<District | null> {
  return prisma.district.findUnique({
    where: { id },
      include: {
      region: true,
      },
  })
}

async function create(data: Prisma.DistrictCreateInput): Promise<District> {

  return prisma.district.create({
    data: {
      ...data,
    },
      include: {
      region: true,
      },
  })
}

async function update(id: number, data: Prisma.DistrictUpdateInput): Promise<District> {


  return prisma.district.update({
    where: { id },
    data: {
      ...data,
    },
      include: {
      region: true,
      },
  })
}

async function deleteDistrict(ids: number[]): Promise<void> {
  await prisma.district.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.district.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}
