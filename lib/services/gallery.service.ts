import prisma from '@/lib/prisma'

export const galleryService = {
  // Get published galleries for gallery list page
  async getPublishedGalleries() {
    return prisma.gallery.findMany({
      where: {
        status: 'published',
        publishedAt: {
          lte: new Date(),
        },
      },
      include: {
        images: {
          take: 1, // Just get first image for cover
          orderBy: {
            sortOrder: 'asc',
          },
        },
        _count: {
          select: {
            images: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })
  },

  // Get single gallery with all images for gallery detail page
  async getGalleryBySlug(slug: string) {
    return prisma.gallery.findUnique({
      where: {
        slug,
        status: 'published',
      },
      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })
  },
}
