'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { getModelConfig } from '@/lib/admin/config'
import { GenericForm } from '@/components/admin/generic-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateEntityPage({
  params,
}: {
  params: Promise<{ entity: string }>
}) {
  const { entity } = use(params)
  const router = useRouter()
  const config = getModelConfig(entity)

  if (!config) {
    return <div>Model not found</div>
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    const response = await fetch(`/api/admin/${config.name.toLowerCase()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      router.push(`/admin/${entity}`)
    } else {
      const error = await response.json()
      console.error('Error creating:', error)
      throw new Error('Failed to create')
    }
  }

  const handleCancel = () => {
    router.push(`/admin/${entity}`)
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
