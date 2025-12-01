'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getModelConfig } from '@/lib/admin/config'
import { GenericForm } from '@/components/admin/generic-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Import server actions
import { createUser } from '@/actions/v2/user.actions'
import { createBlog } from '@/actions/v2/blog.actions'
import { createCategory } from '@/actions/v2/category.actions'
import { createGallery } from '@/actions/v2/gallery.actions'
import { createGalleryImage } from '@/actions/v2/galleryImage.actions'
import { createContactSubmission } from '@/actions/v2/contactSubmission.actions'

// Map entity names to their create actions
const createActionsMap: Record<string, any> = {
  user: createUser,
  blog: createBlog,
  category: createCategory,
  gallery: createGallery,
  galleryimage: createGalleryImage,
  contactsubmission: createContactSubmission,
}

export default function CreateEntityPage({
  params,
}: {
  params: Promise<{ entity: string }>
}) {
  const { entity } = use(params)
  const router = useRouter()
  const config = getModelConfig(entity)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createAction = createActionsMap[entity]

  if (!config) {
    return <div>Model not found</div>
  }

  if (!createAction) {
    return <div>Create action not found for {entity}</div>
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true)
    try {
      const result = await createAction(data)

      if (result.success) {
        router.push(`/admin-v2/${entity}`)
      } else {
        console.error('Error creating:', result.error)
        alert(result.error || 'Failed to create')
        throw new Error(result.error || 'Failed to create')
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/admin-v2/${entity}`)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create {config.nameSingular}</h1>
        <p className="text-muted-foreground">
          Add a new {config.nameSingular.toLowerCase()} to the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{config.nameSingular} Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a new {config.nameSingular.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenericForm
            config={config}
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
