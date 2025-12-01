import prisma from '@/lib/prisma'
import type { Blog, Prisma } from '@prisma/client'
import type { ServiceParams, ServiceResult } from '../types/service.types'

export const blogService = {
  getAll,
  get,
  create,
  update,
  delete: deleteBlog,
  getOptions,
}

async function getAll(params: ServiceParams): Promise<ServiceResult<Blog[]>> {
  const { pagination, search, orderBy } = params
  const { page = 1, pageSize = 10 } = pagination || {}
  const skip = (page - 1) * pageSize

  const where: Prisma.BlogWhereInput = {}
  if (search?.query) {
    where.OR = [
      { title: { contains: search.query, mode: 'insensitive' } },
      { slug: { contains: search.query, mode: 'insensitive' } },
      { content: { contains: search.query, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: {
      author: true,
      categories: {
        include: {
          category: true,
        },
      },
      },
      orderBy: orderBy || {'createdAt':'desc'},
      skip,
      take: pageSize,
    }),
    prisma.blog.count({ where }),
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

async function get(id: number): Promise<Blog | null> {
  return prisma.blog.findUnique({
    where: { id },
      include: {
      author: true,
      categories: {
        include: {
          category: true,
        },
      },
      },
  })
}

async function create(data: Prisma.BlogCreateInput): Promise<Blog> {
  const { categories, ...restData } = data

  return prisma.blog.create({
    data: {
      ...restData,
      categories: Array.isArray(categories)
        ? {
            create: (categories as number[]).map((categoryId: number) => ({
              categoryId: categoryId,
            })),
          }
        : undefined,
    },
      include: {
      author: true,
      categories: {
        include: {
          category: true,
        },
      },
      },
  })
}

async function update(id: number, data: Prisma.BlogUpdateInput): Promise<Blog> {
  const { categories, ...restData } = data

  if (categories !== undefined) {
    await prisma.blogCategory.deleteMany({
      where: { blogId: id },
    })
  }


  return prisma.blog.update({
    where: { id },
    data: {
      ...restData,
      categories: Array.isArray(categories)
        ? {
            create: (categories as number[]).map((categoryId: number) => ({
              categoryId: categoryId,
            })),
          }
        : undefined,
    },
      include: {
      author: true,
      categories: {
        include: {
          category: true,
        },
      },
      },
  })
}

async function deleteBlog(ids: number[]): Promise<void> {
  await prisma.blog.deleteMany({
    where: { id: { in: ids } },
  })
}

async function getOptions(): Promise<Array<{ value: number; label: string }>> {
  const items = await prisma.blog.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  })

  return items.map((item) => ({
    value: item.id,
    label: item.title,
  }))
}
