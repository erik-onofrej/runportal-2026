import prisma from '@/lib/prisma'
import type { Runner, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const runnerService = {
  getAll,
  get,
  create,
  update,
  delete: deleteRunner,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<Runner[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.RunnerWhereInput = {}
  if (search?.query) {
    where.OR = [
      { firstName: { contains: search.query, mode: 'insensitive' } },
      { lastName: { contains: search.query, mode: 'insensitive' } },
      { email: { contains: search.query, mode: 'insensitive' } },
      { club: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.runner.findMany({
      where,
      include: {
      user: true,
      },
      orderBy: orderBy || {'createdAt':'desc'},
      skip,
      take: pageSize,
    }),
    prisma.runner.count({ where }),
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

async function get(id: string): Promise<Runner | null> {
  return prisma.runner.findUnique({
    where: { id },
      include: {
      user: true,
      },
  })
}

async function create(data: Prisma.RunnerCreateInput): Promise<Runner> {

  return prisma.runner.create({
    data: {
      ...data,
    },
      include: {
      user: true,
      },
  })
}

async function update(id: string, data: Prisma.RunnerUpdateInput): Promise<Runner> {


  return prisma.runner.update({
    where: { id },
    data: {
      ...data,
    },
      include: {
      user: true,
      },
  })
}

async function deleteRunner(ids: string[]): Promise<void> {
  await prisma.runner.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: string; label: string }>> {
  const items = await prisma.runner.findMany({
    select: { id: true, firstName: true },
    orderBy: { firstName: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.firstName,
  }))
}
