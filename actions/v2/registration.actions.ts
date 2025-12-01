'use server'

import { revalidatePath } from 'next/cache'
import { registrationService } from '@/lib/admin-v2/services/registration.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllRegistrations(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await registrationService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRegistration(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await registrationService.get(id)
    if (!item) {
      return { success: false, error: 'Registration not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createRegistration(data: Prisma.RegistrationCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await registrationService.create(data)
    revalidatePath('/admin-v2/registration')
    return { success: true, data: item, message: 'Registration created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateRegistration(
  id: number,
  data: Prisma.RegistrationUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await registrationService.update(id, data)
    revalidatePath('/admin-v2/registration')
    revalidatePath(`/admin-v2/registration/${id}`)
    return { success: true, data: item, message: 'Registration updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteRegistration(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await registrationService.delete(ids)
    revalidatePath('/admin-v2/registration')
    return { success: true, message: 'Registration(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRegistrationOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await registrationService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
