'use server'

import { revalidatePath } from 'next/cache'
import { locationService } from '@/lib/admin-v2/services/location.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllLocations(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await locationService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getLocation(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await locationService.get(id)
    if (!item) {
      return { success: false, error: 'Location not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createLocation(data: Prisma.LocationCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await locationService.create(data)
    revalidatePath('/admin-v2/location')
    return { success: true, data: item, message: 'Location created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateLocation(
  id: number,
  data: Prisma.LocationUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await locationService.update(id, data)
    revalidatePath('/admin-v2/location')
    revalidatePath(`/admin-v2/location/${id}`)
    return { success: true, data: item, message: 'Location updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteLocation(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await locationService.delete(ids)
    revalidatePath('/admin-v2/location')
    return { success: true, message: 'Location(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getLocationOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await locationService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
