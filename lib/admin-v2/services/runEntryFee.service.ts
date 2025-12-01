import prisma from '@/lib/prisma'
import type { RunEntryFee, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const runEntryFeeService = {
  getAll,
  get,
  create,
  update,
  delete: deleteRunEntryFee,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<RunEntryFee[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.RunEntryFeeWhereInput = {}
  if (search?.query) {
    where.OR = [
      { name: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.runEntryFee.findMany({
      where,
      include: {
      run: true,
      },
      orderBy: orderBy || {'sortOrder':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.runEntryFee.count({ where }),
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

async function get(id: number): Promise<RunEntryFee | null> {
  return prisma.runEntryFee.findUnique({
    where: { id },
      include: {
      run: true,
      },
  })
}

async function create(data: Prisma.RunEntryFeeCreateInput): Promise<RunEntryFee> {

  return prisma.runEntryFee.create({
    data: {
      ...data,
    },
      include: {
      run: true,
      },
  })
}

async function update(id: number, data: Prisma.RunEntryFeeUpdateInput): Promise<RunEntryFee> {


  return prisma.runEntryFee.update({
    where: { id },
    data: {
      ...data,
    },
      include: {
      run: true,
      },
  })
}

async function deleteRunEntryFee(ids: number[]): Promise<void> {
  await prisma.runEntryFee.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.runEntryFee.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}
