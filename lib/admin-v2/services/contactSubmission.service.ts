import prisma from '@/lib/prisma'
import type { ContactSubmission, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const contactSubmissionService = {
  getAll,
  get,
  create,
  update,
  delete: deleteContactSubmission,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<ContactSubmission[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.ContactSubmissionWhereInput = {}
  if (search?.query) {
    where.OR = [
      { name: { contains: search.query, mode: 'insensitive' } },
      { email: { contains: search.query, mode: 'insensitive' } },
      { message: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      orderBy: orderBy || {'createdAt':'desc'},
      skip,
      take: pageSize,
    }),
    prisma.contactSubmission.count({ where }),
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

async function get(id: number): Promise<ContactSubmission | null> {
  return prisma.contactSubmission.findUnique({
    where: { id },
  })
}

async function create(data: Prisma.ContactSubmissionCreateInput): Promise<ContactSubmission> {

  return prisma.contactSubmission.create({
    data: {
      ...data,
    },
  })
}

async function update(id: number, data: Prisma.ContactSubmissionUpdateInput): Promise<ContactSubmission> {


  return prisma.contactSubmission.update({
    where: { id },
    data: {
      ...data,
    },
  })
}

async function deleteContactSubmission(ids: number[]): Promise<void> {
  await prisma.contactSubmission.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.contactSubmission.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}
