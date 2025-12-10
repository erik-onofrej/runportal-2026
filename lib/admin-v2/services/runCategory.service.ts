import prisma from '@/lib/prisma'
import type { RunCategory, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const runCategoryService = {
  getAll,
  get,
  create,
  update,
  delete: deleteRunCategory,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<RunCategory[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.RunCategoryWhereInput = {}
  if (search?.query) {
    where.OR = [
      { name: { contains: search.query, mode: 'insensitive' } },
      { code: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.runCategory.findMany({
      where,
      include: {
      runs: {
        include: {
          run: true,
        },
      },
      },
      orderBy: orderBy || {'sortOrder':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.runCategory.count({ where }),
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

async function get(id: number): Promise<RunCategory | null> {
  return prisma.runCategory.findUnique({
    where: { id },
      include: {
      runs: {
        include: {
          run: true,
        },
      },
      },
  })
}

async function create(data: Prisma.RunCategoryCreateInput): Promise<RunCategory> {
  const { runs, ...restData } = data

  return prisma.runCategory.create({
    data: {
      ...restData,
      runs: Array.isArray(runs)
        ? {
            create: (runs as number[]).map((runId: number) => ({
              runId: runId,
            })),
          }
        : undefined,
    },
      include: {
      runs: {
        include: {
          run: true,
        },
      },
      },
  })
}

async function update(id: number, data: Prisma.RunCategoryUpdateInput): Promise<RunCategory> {
  const { runs, ...restData } = data

  if (runs !== undefined) {
    await prisma.runCategoryAssignment.deleteMany({
      where: { runCategoryId: id },
    })
  }


  return prisma.runCategory.update({
    where: { id },
    data: {
      ...restData,
      runs: Array.isArray(runs)
        ? {
            create: (runs as number[]).map((runId: number) => ({
              runId: runId,
            })),
          }
        : undefined,
    },
      include: {
      runs: {
        include: {
          run: true,
        },
      },
      },
  })
}

async function deleteRunCategory(ids: number[]): Promise<void> {
  await prisma.runCategory.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.runCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}
