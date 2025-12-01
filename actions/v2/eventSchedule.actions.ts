'use server'

import { revalidatePath } from 'next/cache'
import { eventScheduleService } from '@/lib/admin-v2/services/eventSchedule.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllEventSchedules(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await eventScheduleService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getEventSchedule(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await eventScheduleService.get(id)
    if (!item) {
      return { success: false, error: 'EventSchedule not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createEventSchedule(data: Prisma.EventScheduleCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await eventScheduleService.create(data)
    revalidatePath('/admin-v2/eventSchedule')
    return { success: true, data: item, message: 'EventSchedule created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateEventSchedule(
  id: number,
  data: Prisma.EventScheduleUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await eventScheduleService.update(id, data)
    revalidatePath('/admin-v2/eventSchedule')
    revalidatePath(`/admin-v2/eventSchedule/${id}`)
    return { success: true, data: item, message: 'EventSchedule updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteEventSchedule(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await eventScheduleService.delete(ids)
    revalidatePath('/admin-v2/eventSchedule')
    return { success: true, message: 'EventSchedule(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getEventScheduleOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await eventScheduleService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
