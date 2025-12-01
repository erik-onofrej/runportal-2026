'use server'

import { revalidatePath } from 'next/cache'
import { regionService } from '@/lib/admin-v2/services/region.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllRegions(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await regionService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRegion(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await regionService.get(id)
    if (!item) {
      return { success: false, error: 'Region not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createRegion(data: Prisma.RegionCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await regionService.create(data)
    revalidatePath('/admin-v2/region')
    return { success: true, data: item, message: 'Region created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateRegion(
  id: number,
  data: Prisma.RegionUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await regionService.update(id, data)
    revalidatePath('/admin-v2/region')
    revalidatePath(`/admin-v2/region/${id}`)
    return { success: true, data: item, message: 'Region updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteRegion(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await regionService.delete(ids)
    revalidatePath('/admin-v2/region')
    return { success: true, message: 'Region(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRegionOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await regionService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
