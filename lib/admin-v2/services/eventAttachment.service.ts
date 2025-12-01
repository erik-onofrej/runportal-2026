import prisma from '@/lib/prisma'
import type { EventAttachment, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const eventAttachmentService = {
  getAll,
  get,
  create,
  update,
  delete: deleteEventAttachment,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<EventAttachment[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.EventAttachmentWhereInput = {}
  if (search?.query) {
    where.OR = [
      { title: { contains: search.query, mode: 'insensitive' } },
      { description: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.eventAttachment.findMany({
      where,
      include: {
      event: true,
      },
      orderBy: orderBy || {'sortOrder':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.eventAttachment.count({ where }),
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

async function get(id: number): Promise<EventAttachment | null> {
  return prisma.eventAttachment.findUnique({
    where: { id },
      include: {
      event: true,
      },
  })
}

async function create(data: Prisma.EventAttachmentCreateInput): Promise<EventAttachment> {

  return prisma.eventAttachment.create({
    data: {
      ...data,
    },
      include: {
      event: true,
      },
  })
}

async function update(id: number, data: Prisma.EventAttachmentUpdateInput): Promise<EventAttachment> {


  return prisma.eventAttachment.update({
    where: { id },
    data: {
      ...data,
    },
      include: {
      event: true,
      },
  })
}

async function deleteEventAttachment(ids: number[]): Promise<void> {
  await prisma.eventAttachment.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.eventAttachment.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.title,
  }))
}
