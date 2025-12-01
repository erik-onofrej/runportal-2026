'use server'

import { revalidatePath } from 'next/cache'
import { runCategoryService } from '@/lib/admin-v2/services/runCategory.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllRunCategories(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await runCategoryService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRunCategory(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runCategoryService.get(id)
    if (!item) {
      return { success: false, error: 'RunCategory not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createRunCategory(data: Prisma.RunCategoryCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runCategoryService.create(data)
    revalidatePath('/admin-v2/runCategory')
    return { success: true, data: item, message: 'RunCategory created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateRunCategory(
  id: number,
  data: Prisma.RunCategoryUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runCategoryService.update(id, data)
    revalidatePath('/admin-v2/runCategory')
    revalidatePath(`/admin-v2/runCategory/${id}`)
    return { success: true, data: item, message: 'RunCategory updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteRunCategory(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await runCategoryService.delete(ids)
    revalidatePath('/admin-v2/runCategory')
    return { success: true, message: 'RunCategory(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRunCategoryOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await runCategoryService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
