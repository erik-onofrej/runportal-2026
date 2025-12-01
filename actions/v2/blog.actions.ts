'use server'

import { revalidatePath } from 'next/cache'
import { blogService } from '@/lib/admin-v2/services/blog.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllBlogs(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await blogService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getBlog(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await blogService.get(id)
    if (!item) {
      return { success: false, error: 'Blog not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createBlog(data: Prisma.BlogCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await blogService.create(data)
    revalidatePath('/admin-v2/blog')
    return { success: true, data: item, message: 'Blog created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateBlog(
  id: number,
  data: Prisma.BlogUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await blogService.update(id, data)
    revalidatePath('/admin-v2/blog')
    revalidatePath(`/admin-v2/blog/${id}`)
    return { success: true, data: item, message: 'Blog updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteBlog(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await blogService.delete(ids)
    revalidatePath('/admin-v2/blog')
    return { success: true, message: 'Blog(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getBlogOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await blogService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
