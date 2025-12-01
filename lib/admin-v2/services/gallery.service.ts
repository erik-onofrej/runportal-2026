import prisma from '@/lib/prisma'
import type { Gallery, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const galleryService = {
  getAll,
  get,
  create,
  update,
  delete: deleteGallery,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<Gallery[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.GalleryWhereInput = {}
  if (search?.query) {
    where.OR = [
      { title: { contains: search.query, mode: 'insensitive' } },
      { description: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.gallery.findMany({
      where,
      orderBy: orderBy || {'sortOrder':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.gallery.count({ where }),
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

async function get(id: number): Promise<Gallery | null> {
  return prisma.gallery.findUnique({
    where: { id },
  })
}

async function create(data: Prisma.GalleryCreateInput): Promise<Gallery> {

  return prisma.gallery.create({
    data: {
      ...data,
    },
  })
}

async function update(id: number, data: Prisma.GalleryUpdateInput): Promise<Gallery> {


  return prisma.gallery.update({
    where: { id },
    data: {
      ...data,
    },
  })
}

async function deleteGallery(ids: number[]): Promise<void> {
  await prisma.gallery.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.gallery.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.title,
  }))
}
