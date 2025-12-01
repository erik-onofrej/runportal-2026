'use server'

import { revalidatePath } from 'next/cache'
import { categoryService } from '@/lib/admin-v2/services/category.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllCategories(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await categoryService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getCategory(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await categoryService.get(id)
    if (!item) {
      return { success: false, error: 'Category not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createCategory(data: Prisma.CategoryCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await categoryService.create(data)
    revalidatePath('/admin-v2/category')
    return { success: true, data: item, message: 'Category created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateCategory(
  id: number,
  data: Prisma.CategoryUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await categoryService.update(id, data)
    revalidatePath('/admin-v2/category')
    revalidatePath(`/admin-v2/category/${id}`)
    return { success: true, data: item, message: 'Category updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteCategory(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await categoryService.delete(ids)
    revalidatePath('/admin-v2/category')
    return { success: true, message: 'Category(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getCategoryOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await categoryService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
