'use server'

import { revalidatePath } from 'next/cache'
import { eventAttachmentService } from '@/lib/admin-v2/services/eventAttachment.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllEventAttachments(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await eventAttachmentService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getEventAttachment(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await eventAttachmentService.get(id)
    if (!item) {
      return { success: false, error: 'EventAttachment not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createEventAttachment(data: Prisma.EventAttachmentCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await eventAttachmentService.create(data)
    revalidatePath('/admin-v2/eventAttachment')
    return { success: true, data: item, message: 'EventAttachment created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateEventAttachment(
  id: number,
  data: Prisma.EventAttachmentUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await eventAttachmentService.update(id, data)
    revalidatePath('/admin-v2/eventAttachment')
    revalidatePath(`/admin-v2/eventAttachment/${id}`)
    return { success: true, data: item, message: 'EventAttachment updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteEventAttachment(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await eventAttachmentService.delete(ids)
    revalidatePath('/admin-v2/eventAttachment')
    return { success: true, message: 'EventAttachment(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getEventAttachmentOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await eventAttachmentService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
