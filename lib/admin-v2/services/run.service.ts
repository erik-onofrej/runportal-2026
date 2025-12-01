import prisma from '@/lib/prisma'
import type { Run, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const runService = {
  getAll,
  get,
  create,
  update,
  delete: deleteRun,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<Run[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.RunWhereInput = {}
  if (search?.query) {
    where.OR = [
      { name: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.run.findMany({
      where,
      include: {
      event: true,
      },
      orderBy: orderBy || {'sortOrder':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.run.count({ where }),
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

async function get(id: number): Promise<Run | null> {
  return prisma.run.findUnique({
    where: { id },
      include: {
      event: true,
      },
  })
}

async function create(data: Prisma.RunCreateInput): Promise<Run> {

  return prisma.run.create({
    data: {
      ...data,
    },
      include: {
      event: true,
      },
  })
}

async function update(id: number, data: Prisma.RunUpdateInput): Promise<Run> {


  return prisma.run.update({
    where: { id },
    data: {
      ...data,
    },
      include: {
      event: true,
      },
  })
}

async function deleteRun(ids: number[]): Promise<void> {
  await prisma.run.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.run.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}
