import prisma from '@/lib/prisma'
import type { Partner, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const partnerService = {
  getAll,
  get,
  create,
  update,
  delete: deletePartner,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<Partner[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.PartnerWhereInput = {}
  if (search?.query) {
    where.OR = [
      { name: { contains: search.query, mode: 'insensitive' } },
      { description: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      include: {
      events: {
        include: {
          event: true,
        },
      },
      },
      orderBy: orderBy || {'name':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.partner.count({ where }),
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

async function get(id: number): Promise<Partner | null> {
  return prisma.partner.findUnique({
    where: { id },
      include: {
      events: {
        include: {
          event: true,
        },
      },
      },
  })
}

async function create(data: Prisma.PartnerCreateInput): Promise<Partner> {
  const { events, ...restData } = data

  return prisma.partner.create({
    data: {
      ...restData,
      events: Array.isArray(events)
        ? {
            create: (events as number[]).map((eventId: number) => ({
              eventId: eventId,
            })),
          }
        : undefined,
    },
      include: {
      events: {
        include: {
          event: true,
        },
      },
      },
  })
}

async function update(id: number, data: Prisma.PartnerUpdateInput): Promise<Partner> {
  const { events, ...restData } = data

  if (events !== undefined) {
    await prisma.eventPartner.deleteMany({
      where: { partnerId: id },
    })
  }


  return prisma.partner.update({
    where: { id },
    data: {
      ...restData,
      events: Array.isArray(events)
        ? {
            create: (events as number[]).map((eventId: number) => ({
              eventId: eventId,
            })),
          }
        : undefined,
    },
      include: {
      events: {
        include: {
          event: true,
        },
      },
      },
  })
}

async function deletePartner(ids: number[]): Promise<void> {
  await prisma.partner.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.partner.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}
