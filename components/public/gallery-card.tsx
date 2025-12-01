import Link from 'next/link'

interface GalleryCardProps {
  gallery: {
    id: number
    title: string
    slug: string
    description: string | null
    coverImage: string | null
    images: Array<{
      imageUrl: string
    }>
    _count: {
      images: number
    }
  }
}

export function GalleryCard({ gallery }: GalleryCardProps) {
  const coverImageUrl = gallery.coverImage || gallery.images[0]?.imageUrl

  return (
    <Link
      href={`/galleries/${gallery.slug}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
    >
      <div className="aspect-video overflow-hidden bg-muted">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={gallery.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No images
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-xl font-semibold group-hover:text-primary">
          {gallery.title}
        </h3>
        {gallery.description && (
          <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
            {gallery.description}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {gallery._count.images} {gallery._count.images === 1 ? 'photo' : 'photos'}
        </p>
      </div>
    </Link>
  )
}
