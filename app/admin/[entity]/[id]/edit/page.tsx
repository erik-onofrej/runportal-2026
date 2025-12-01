'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getModelConfig } from '@/lib/admin/config'
import { GenericForm } from '@/components/admin/generic-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditEntityPage({
  params,
}: {
  params: Promise<{ entity: string; id: string }>
}) {
  const { entity, id } = use(params)
  const router = useRouter()
  const config = getModelConfig(entity)
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!config) return
    fetchData()
  }, [config])

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/admin/${config?.name.toLowerCase()}/${id}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!config) {
    return <div>Model not found</div>
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const handleSubmit = async (formData: Record<string, unknown>) => {
    const response = await fetch(`/api/admin/${config.name.toLowerCase()}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      router.push(`/admin/${entity}`)
    } else {
      const error = await response.json()
      console.error('Error updating:', error)
      throw new Error('Failed to update')
    }
  }

  const handleCancel = () => {
    router.push(`/admin/${entity}`)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit {config.nameSingular}</h1>
        <p className="text-muted-foreground">
          Update the {config.nameSingular.toLowerCase()} information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{config.nameSingular} Details</CardTitle>
          <CardDescription>
            Modify the information below to update this {config.nameSingular.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenericForm
            config={config}
            mode="edit"
            defaultValues={data || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
