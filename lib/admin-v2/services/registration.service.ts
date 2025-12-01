import prisma from '@/lib/prisma'
import type { Registration, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const registrationService = {
  getAll,
  get,
  create,
  update,
  delete: deleteRegistration,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<Registration[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.RegistrationWhereInput = {}
  if (search?.query) {
    where.OR = [
      { registrationNumber: { contains: search.query, mode: 'insensitive' } },
      { guestFirstName: { contains: search.query, mode: 'insensitive' } },
      { guestLastName: { contains: search.query, mode: 'insensitive' } },
      { guestEmail: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      include: {
      run: true,
      category: true,
      runner: true,
      },
      orderBy: orderBy || {'registeredAt':'desc'},
      skip,
      take: pageSize,
    }),
    prisma.registration.count({ where }),
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

async function get(id: number): Promise<Registration | null> {
  return prisma.registration.findUnique({
    where: { id },
      include: {
      run: true,
      category: true,
      runner: true,
      },
  })
}

async function create(data: Prisma.RegistrationCreateInput): Promise<Registration> {

  return prisma.registration.create({
    data: {
      ...data,
    },
      include: {
      run: true,
      category: true,
      runner: true,
      },
  })
}

async function update(id: number, data: Prisma.RegistrationUpdateInput): Promise<Registration> {


  return prisma.registration.update({
    where: { id },
    data: {
      ...data,
    },
      include: {
      run: true,
      category: true,
      runner: true,
      },
  })
}

async function deleteRegistration(ids: number[]): Promise<void> {
  await prisma.registration.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.registration.findMany({
    select: { id: true, registrationNumber: true },
    orderBy: { registrationNumber: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.registrationNumber,
  }))
}
