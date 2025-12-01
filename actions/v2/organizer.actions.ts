'use server'

import { revalidatePath } from 'next/cache'
import { organizerService } from '@/lib/admin-v2/services/organizer.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllOrganizers(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await organizerService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getOrganizer(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await organizerService.get(id)
    if (!item) {
      return { success: false, error: 'Organizer not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createOrganizer(data: Prisma.OrganizerCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await organizerService.create(data)
    revalidatePath('/admin-v2/organizer')
    return { success: true, data: item, message: 'Organizer created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateOrganizer(
  id: number,
  data: Prisma.OrganizerUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await organizerService.update(id, data)
    revalidatePath('/admin-v2/organizer')
    revalidatePath(`/admin-v2/organizer/${id}`)
    return { success: true, data: item, message: 'Organizer updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteOrganizer(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await organizerService.delete(ids)
    revalidatePath('/admin-v2/organizer')
    return { success: true, message: 'Organizer(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getOrganizerOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await organizerService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
