'use server'

import { revalidatePath } from 'next/cache'
import { contactSubmissionService } from '@/lib/admin-v2/services/contactSubmission.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllContactSubmissions(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await contactSubmissionService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getContactSubmission(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await contactSubmissionService.get(id)
    if (!item) {
      return { success: false, error: 'ContactSubmission not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createContactSubmission(data: Prisma.ContactSubmissionCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await contactSubmissionService.create(data)
    revalidatePath('/admin-v2/contactSubmission')
    return { success: true, data: item, message: 'ContactSubmission created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateContactSubmission(
  id: number,
  data: Prisma.ContactSubmissionUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await contactSubmissionService.update(id, data)
    revalidatePath('/admin-v2/contactSubmission')
    revalidatePath(`/admin-v2/contactSubmission/${id}`)
    return { success: true, data: item, message: 'ContactSubmission updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteContactSubmission(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await contactSubmissionService.delete(ids)
    revalidatePath('/admin-v2/contactSubmission')
    return { success: true, message: 'ContactSubmission(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getContactSubmissionOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await contactSubmissionService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
