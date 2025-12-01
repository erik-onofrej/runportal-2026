import prisma from '@/lib/prisma'

export const blogService = {
  // Get published blogs for blog list page
  async getPublishedBlogs(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: {
          status: 'published',
          publishedAt: {
            lte: new Date(),
          },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.blog.count({
        where: {
          status: 'published',
          publishedAt: {
            lte: new Date(),
          },
        },
      }),
    ])

    return {
      blogs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  },

  // Get single blog by slug for blog detail page
  async getBlogBySlug(slug: string) {
    const blog = await prisma.blog.findUnique({
      where: {
        slug,
        status: 'published',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    })

    if (blog) {
      // Increment view count
      await prisma.blog.update({
        where: { id: blog.id },
        data: { views: { increment: 1 } },
      })
    }

    return blog
  },

  // Get recent blogs for sidebar/featured
  async getRecentBlogs(limit: number = 5) {
    return prisma.blog.findMany({
      where: {
        status: 'published',
        publishedAt: {
          lte: new Date(),
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
    })
  },
}
