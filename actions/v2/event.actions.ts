'use server'

import { revalidatePath } from 'next/cache'
import { eventService } from '@/lib/admin-v2/services/event.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllEvents(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await eventService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getEvent(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await eventService.get(id)
    if (!item) {
      return { success: false, error: 'Event not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createEvent(data: Prisma.EventCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await eventService.create(data)
    revalidatePath('/admin-v2/event')
    return { success: true, data: item, message: 'Event created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateEvent(
  id: number,
  data: Prisma.EventUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await eventService.update(id, data)
    revalidatePath('/admin-v2/event')
    revalidatePath(`/admin-v2/event/${id}`)
    return { success: true, data: item, message: 'Event updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteEvent(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await eventService.delete(ids)
    revalidatePath('/admin-v2/event')
    return { success: true, message: 'Event(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getEventOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await eventService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
