import prisma from '@/lib/prisma'
import type { GalleryImage, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const galleryImageService = {
  getAll,
  get,
  create,
  update,
  delete: deleteGalleryImage,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<GalleryImage[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.GalleryImageWhereInput = {}
  if (search?.query) {
    where.OR = [
      { title: { contains: search.query, mode: 'insensitive' } },
      { description: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.galleryImage.findMany({
      where,
      include: {
      gallery: true,
      },
      orderBy: orderBy || {'sortOrder':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.galleryImage.count({ where }),
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

async function get(id: number): Promise<GalleryImage | null> {
  return prisma.galleryImage.findUnique({
    where: { id },
      include: {
      gallery: true,
      },
  })
}

async function create(data: Prisma.GalleryImageCreateInput): Promise<GalleryImage> {

  return prisma.galleryImage.create({
    data: {
      ...data,
    },
      include: {
      gallery: true,
      },
  })
}

async function update(id: number, data: Prisma.GalleryImageUpdateInput): Promise<GalleryImage> {


  return prisma.galleryImage.update({
    where: { id },
    data: {
      ...data,
    },
      include: {
      gallery: true,
      },
  })
}

async function deleteGalleryImage(ids: number[]): Promise<void> {
  await prisma.galleryImage.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.galleryImage.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.title || `Image ${item.id}`,
  }))
}
