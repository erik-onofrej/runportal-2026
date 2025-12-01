import { galleryService } from '@/lib/services/gallery.service'
import { GalleryCard } from '@/components/public/gallery-card'

export const metadata = {
  title: 'Photo Galleries',
  description: 'Browse our photo galleries',
}

export default async function GalleriesPage() {
  const galleries = await galleryService.getPublishedGalleries()

  return (
    <div className="container px-4 py-12 mx-auto md:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">Photo Galleries</h1>
        <p className="text-xl text-muted-foreground">
          Explore our collection of photo galleries
        </p>
      </div>

      {galleries.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No galleries published yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {galleries.map((gallery) => (
            <GalleryCard key={gallery.id} gallery={gallery} />
          ))}
        </div>
      )}
    </div>
  )
}
