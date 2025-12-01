'use server'

import { revalidatePath } from 'next/cache'
import { runResultService } from '@/lib/admin-v2/services/runResult.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllRunResults(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await runResultService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRunResult(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runResultService.get(id)
    if (!item) {
      return { success: false, error: 'RunResult not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createRunResult(data: Prisma.RunResultCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runResultService.create(data)
    revalidatePath('/admin-v2/runResult')
    return { success: true, data: item, message: 'RunResult created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateRunResult(
  id: number,
  data: Prisma.RunResultUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runResultService.update(id, data)
    revalidatePath('/admin-v2/runResult')
    revalidatePath(`/admin-v2/runResult/${id}`)
    return { success: true, data: item, message: 'RunResult updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteRunResult(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await runResultService.delete(ids)
    revalidatePath('/admin-v2/runResult')
    return { success: true, message: 'RunResult(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRunResultOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await runResultService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
