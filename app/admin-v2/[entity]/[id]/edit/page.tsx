'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getModelConfig } from '@/lib/admin/config'
import { GenericForm } from '@/components/admin/generic-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Import server actions
import { getUser, updateUser } from '@/actions/v2/user.actions'
import { getBlog, updateBlog } from '@/actions/v2/blog.actions'
import { getCategory, updateCategory } from '@/actions/v2/category.actions'
import { getContactSubmission, updateContactSubmission } from '@/actions/v2/contactSubmission.actions'
// Running Events Actions
import { getRegion, updateRegion } from '@/actions/v2/region.actions'
import { getDistrict, updateDistrict } from '@/actions/v2/district.actions'
import { getLocation, updateLocation } from '@/actions/v2/location.actions'
import { getOrganizer, updateOrganizer } from '@/actions/v2/organizer.actions'
import { getEvent, updateEvent } from '@/actions/v2/event.actions'
import { getRun, updateRun } from '@/actions/v2/run.actions'
import { getRunCategory, updateRunCategory } from '@/actions/v2/runCategory.actions'
import { getRunEntryFee, updateRunEntryFee } from '@/actions/v2/runEntryFee.actions'
import { getEventSchedule, updateEventSchedule } from '@/actions/v2/eventSchedule.actions'
import { getPartner, updatePartner } from '@/actions/v2/partner.actions'
import { getEventAttachment, updateEventAttachment } from '@/actions/v2/eventAttachment.actions'
import { getRunner, updateRunner } from '@/actions/v2/runner.actions'
import { getRegistration, updateRegistration } from '@/actions/v2/registration.actions'
import { getRunResult, updateRunResult } from '@/actions/v2/runResult.actions'

// Map entity names to their actions
const actionsMap: Record<string, any> = {
  user: { get: getUser, update: updateUser },
  blog: { get: getBlog, update: updateBlog },
  category: { get: getCategory, update: updateCategory },
  contactsubmission: { get: getContactSubmission, update: updateContactSubmission },
  // Running Events
  region: { get: getRegion, update: updateRegion },
  district: { get: getDistrict, update: updateDistrict },
  location: { get: getLocation, update: updateLocation },
  organizer: { get: getOrganizer, update: updateOrganizer },
  event: { get: getEvent, update: updateEvent },
  run: { get: getRun, update: updateRun },
  runcategory: { get: getRunCategory, update: updateRunCategory },
  runentryfee: { get: getRunEntryFee, update: updateRunEntryFee },
  eventschedule: { get: getEventSchedule, update: updateEventSchedule },
  partner: { get: getPartner, update: updatePartner },
  eventattachment: { get: getEventAttachment, update: updateEventAttachment },
  runner: { get: getRunner, update: updateRunner },
  registration: { get: getRegistration, update: updateRegistration },
  runresult: { get: getRunResult, update: updateRunResult },
}

export default function EditEntityPage({
  params,
}: {
  params: Promise<{ entity: string; id: string }>
}) {
  const { entity, id } = use(params)
  const router = useRouter()
  const config = getModelConfig(entity)
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const actions = actionsMap[entity]

  useEffect(() => {
    if (!config || !actions) return
    fetchData()
  }, [config])

  const fetchData = async () => {
    if (!actions) return

    try {
      // Convert id to the appropriate type (number or string)
      const parsedId = config?.fields.find(f => f.name === 'id')?.type === 'number'
        ? parseInt(id)
        : id

      const result = await actions.get(parsedId)

      if (result.success && result.data) {
        setData(result.data)
      } else {
        console.error('Error fetching data:', result.error)
        alert(result.error || 'Failed to load data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  if (!config) {
    return <div>Model not found</div>
  }

  if (!actions) {
    return <div>Actions not found for {entity}</div>
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!data) {
    return <div>No data found</div>
  }

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setIsSubmitting(true)
    try {
      // Convert id to the appropriate type (number or string)
      const parsedId = config?.fields.find(f => f.name === 'id')?.type === 'number'
        ? parseInt(id)
        : id

      const result = await actions.update(parsedId, formData)

      if (result.success) {
        router.push(`/admin-v2/${entity}`)
      } else {
        console.error('Error updating:', result.error)
        alert(result.error || 'Failed to update')
        throw new Error(result.error || 'Failed to update')
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
            defaultValues={data}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
