'use server'

import { revalidatePath } from 'next/cache'
import { galleryImageService } from '@/lib/admin-v2/services/galleryImage.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllGalleryImages(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await galleryImageService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getGalleryImage(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await galleryImageService.get(id)
    if (!item) {
      return { success: false, error: 'GalleryImage not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createGalleryImage(data: Prisma.GalleryImageCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await galleryImageService.create(data)
    revalidatePath('/admin-v2/galleryImage')
    return { success: true, data: item, message: 'GalleryImage created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateGalleryImage(
  id: number,
  data: Prisma.GalleryImageUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await galleryImageService.update(id, data)
    revalidatePath('/admin-v2/galleryImage')
    revalidatePath(`/admin-v2/galleryImage/${id}`)
    return { success: true, data: item, message: 'GalleryImage updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteGalleryImage(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await galleryImageService.delete(ids)
    revalidatePath('/admin-v2/galleryImage')
    return { success: true, message: 'GalleryImage(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getGalleryImageOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await galleryImageService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
