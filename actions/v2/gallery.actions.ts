'use server'

import { revalidatePath } from 'next/cache'
import { galleryService } from '@/lib/admin-v2/services/gallery.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllGalleries(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await galleryService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getGallery(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await galleryService.get(id)
    if (!item) {
      return { success: false, error: 'Gallery not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createGallery(data: Prisma.GalleryCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await galleryService.create(data)
    revalidatePath('/admin-v2/gallery')
    return { success: true, data: item, message: 'Gallery created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateGallery(
  id: number,
  data: Prisma.GalleryUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await galleryService.update(id, data)
    revalidatePath('/admin-v2/gallery')
    revalidatePath(`/admin-v2/gallery/${id}`)
    return { success: true, data: item, message: 'Gallery updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteGallery(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await galleryService.delete(ids)
    revalidatePath('/admin-v2/gallery')
    return { success: true, message: 'Gallery(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getGalleryOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await galleryService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
