import { notFound } from 'next/navigation'
import { galleryService } from '@/lib/services/gallery.service'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const gallery = await galleryService.getGalleryBySlug(slug)

  if (!gallery) {
    return {
      title: 'Gallery Not Found',
    }
  }

  return {
    title: gallery.title,
    description: gallery.description || `Photo gallery: ${gallery.title}`,
  }
}

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const gallery = await galleryService.getGalleryBySlug(slug)

  if (!gallery) {
    notFound()
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/galleries">← Back to Galleries</Link>
        </Button>

        {/* Gallery Header */}
        <header className="mb-12">
          <h1 className="mb-4 text-4xl font-bold">{gallery.title}</h1>
          {gallery.description && (
            <p className="text-xl text-muted-foreground">{gallery.description}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {gallery.images.length} {gallery.images.length === 1 ? 'photo' : 'photos'}
          </p>
        </header>

        {/* Gallery Images Grid */}
        {gallery.images.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No images in this gallery yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gallery.images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <img
                  src={image.imageUrl}
                  alt={image.title || 'Gallery image'}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                {(image.title || image.description) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute bottom-0 p-4 text-white">
                      {image.title && (
                        <h3 className="font-semibold">{image.title}</h3>
                      )}
                      {image.description && (
                        <p className="text-sm">{image.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
