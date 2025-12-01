import prisma from '@/lib/prisma'
import type { User, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const userService = {
  getAll,
  get,
  create,
  update,
  delete: deleteUser,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<User[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.UserWhereInput = {}
  if (search?.query) {
    where.OR = [
      { name: { contains: search.query, mode: 'insensitive' } },
      { email: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: orderBy || {'createdAt':'desc'},
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
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

async function get(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  })
}

async function create(data: Prisma.UserCreateInput): Promise<User> {

  return prisma.user.create({
    data: {
      ...data,
    },
  })
}

async function update(id: string, data: Prisma.UserUpdateInput): Promise<User> {


  return prisma.user.update({
    where: { id },
    data: {
      ...data,
    },
  })
}

async function deleteUser(ids: string[]): Promise<void> {
  await prisma.user.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: string; label: string }>> {
  const items = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}
