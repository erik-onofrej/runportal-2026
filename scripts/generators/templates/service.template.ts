import prisma from '@/lib/prisma'
import type { [ENTITY], Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const [MODEL_CAMEL]Service = {
  getAll,
  get,
  create,
  update,
  delete: delete[ENTITY],
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<[ENTITY][]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.[ENTITY]WhereInput = {}
  if (search?.query) {
    where.OR = [
[SEARCH_FIELDS_OR]
    ]
  }

  const [data, total] = await Promise.all([
    prisma.[MODEL].findMany({
      where,
[INCLUDE_BLOCK]
      orderBy: orderBy || [DEFAULT_ORDER_BY],
      skip,
      take: pageSize,
    }),
    prisma.[MODEL].count({ where }),
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

async function get(id: [ID_TYPE]): Promise<[ENTITY] | null> {
  return prisma.[MODEL].findUnique({
    where: { id },
[INCLUDE_BLOCK]
  })
}

async function create(data: Prisma.[ENTITY]CreateInput): Promise<[ENTITY]> {
[MANY_TO_MANY_EXTRACT]

  return prisma.[MODEL].create({
    data: {
      ...[DATA_VAR],
[MANY_TO_MANY_CREATE]
    },
[INCLUDE_BLOCK]
  })
}

async function update(id: [ID_TYPE], data: Prisma.[ENTITY]UpdateInput): Promise<[ENTITY]> {
[MANY_TO_MANY_EXTRACT]

[MANY_TO_MANY_DELETE_OLD]

  return prisma.[MODEL].update({
    where: { id },
    data: {
      ...[DATA_VAR],
[MANY_TO_MANY_CREATE]
    },
[INCLUDE_BLOCK]
  })
}

async function delete[ENTITY](ids: [ID_TYPE][]): Promise<void> {
  await prisma.[MODEL].deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: [ID_TYPE]; label: string }>> {
  const items = await prisma.[MODEL].findMany({
    select: { id: true, [OPTION_FIELD]: true },
    orderBy: { [OPTION_FIELD]: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.[OPTION_FIELD],
  }))
}
