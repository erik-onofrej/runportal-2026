'use server'

import { revalidatePath } from 'next/cache'
import { districtService } from '@/lib/admin-v2/services/district.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllDistricts(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await districtService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getDistrict(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await districtService.get(id)
    if (!item) {
      return { success: false, error: 'District not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createDistrict(data: Prisma.DistrictCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await districtService.create(data)
    revalidatePath('/admin-v2/district')
    return { success: true, data: item, message: 'District created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateDistrict(
  id: number,
  data: Prisma.DistrictUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await districtService.update(id, data)
    revalidatePath('/admin-v2/district')
    revalidatePath(`/admin-v2/district/${id}`)
    return { success: true, data: item, message: 'District updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteDistrict(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await districtService.delete(ids)
    revalidatePath('/admin-v2/district')
    return { success: true, message: 'District(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getDistrictOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await districtService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
