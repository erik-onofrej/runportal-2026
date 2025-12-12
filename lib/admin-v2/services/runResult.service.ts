import prisma from '@/lib/prisma'
import type { RunResult, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const runResultService = {
  getAll,
  get,
  create,
  update,
  delete: deleteRunResult,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<RunResult[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.RunResultWhereInput = {}
  if (search?.query) {
    where.OR = [
      { firstName: { contains: search.query, mode: 'insensitive' } },
      { lastName: { contains: search.query, mode: 'insensitive' } },
      { club: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.runResult.findMany({
      where,
      include: {
      run: true,
      },
      orderBy: orderBy || {'overallPlace':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.runResult.count({ where }),
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

async function get(id: number): Promise<RunResult | null> {
  return prisma.runResult.findUnique({
    where: { id },
      include: {
      run: true,
      },
  })
}

async function create(data: Prisma.RunResultCreateInput): Promise<RunResult> {

  return prisma.runResult.create({
    data: {
      ...data,
    },
      include: {
      run: true,
      },
  })
}

async function update(id: number, data: Prisma.RunResultUpdateInput): Promise<RunResult> {


  return prisma.runResult.update({
    where: { id },
    data: {
      ...data,
    },
      include: {
      run: true,
      },
  })
}

async function deleteRunResult(ids: number[]): Promise<void> {
  await prisma.runResult.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.runResult.findMany({
    select: { id: true, id: true },
    orderBy: { id: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.id,
  }))
}
