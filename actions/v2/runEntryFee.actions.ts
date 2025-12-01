'use server'

import { revalidatePath } from 'next/cache'
import { runEntryFeeService } from '@/lib/admin-v2/services/runEntryFee.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllRunEntryFees(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await runEntryFeeService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRunEntryFee(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runEntryFeeService.get(id)
    if (!item) {
      return { success: false, error: 'RunEntryFee not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createRunEntryFee(data: Prisma.RunEntryFeeCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runEntryFeeService.create(data)
    revalidatePath('/admin-v2/runEntryFee')
    return { success: true, data: item, message: 'RunEntryFee created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateRunEntryFee(
  id: number,
  data: Prisma.RunEntryFeeUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runEntryFeeService.update(id, data)
    revalidatePath('/admin-v2/runEntryFee')
    revalidatePath(`/admin-v2/runEntryFee/${id}`)
    return { success: true, data: item, message: 'RunEntryFee updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteRunEntryFee(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await runEntryFeeService.delete(ids)
    revalidatePath('/admin-v2/runEntryFee')
    return { success: true, message: 'RunEntryFee(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRunEntryFeeOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await runEntryFeeService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
