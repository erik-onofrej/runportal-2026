import prisma from '@/lib/prisma'
import type { Category, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const categoryService = {
  getAll,
  get,
  create,
  update,
  delete: deleteCategory,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<Category[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.CategoryWhereInput = {}
  if (search?.query) {
    where.OR = [
      { name: { contains: search.query, mode: 'insensitive' } },
      { description: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: {
      blogs: {
        include: {
          blog: true,
        },
      },
      },
      orderBy: orderBy || {'sortOrder':'asc'},
      skip,
      take: pageSize,
    }),
    prisma.category.count({ where }),
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

async function get(id: number): Promise<Category | null> {
  return prisma.category.findUnique({
    where: { id },
      include: {
      blogs: {
        include: {
          blog: true,
        },
      },
      },
  })
}

async function create(data: Prisma.CategoryCreateInput): Promise<Category> {
  const { blogs, ...restData } = data

  return prisma.category.create({
    data: {
      ...restData,
      blogs: Array.isArray(blogs)
        ? {
            create: (blogs as number[]).map((blogId: number) => ({
              blogId: blogId,
            })),
          }
        : undefined,
    },
      include: {
      blogs: {
        include: {
          blog: true,
        },
      },
      },
  })
}

async function update(id: number, data: Prisma.CategoryUpdateInput): Promise<Category> {
  const { blogs, ...restData } = data

  if (blogs !== undefined) {
    await prisma.blogCategory.deleteMany({
      where: { categoryId: id },
    })
  }


  return prisma.category.update({
    where: { id },
    data: {
      ...restData,
      blogs: Array.isArray(blogs)
        ? {
            create: (blogs as number[]).map((blogId: number) => ({
              blogId: blogId,
            })),
          }
        : undefined,
    },
      include: {
      blogs: {
        include: {
          blog: true,
        },
      },
      },
  })
}

async function deleteCategory(ids: number[]): Promise<void> {
  await prisma.category.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}
