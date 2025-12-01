'use server'

import { revalidatePath } from 'next/cache'
import { runService } from '@/lib/admin-v2/services/run.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllRuns(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await runService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRun(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runService.get(id)
    if (!item) {
      return { success: false, error: 'Run not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createRun(data: Prisma.RunCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runService.create(data)
    revalidatePath('/admin-v2/run')
    return { success: true, data: item, message: 'Run created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateRun(
  id: number,
  data: Prisma.RunUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runService.update(id, data)
    revalidatePath('/admin-v2/run')
    revalidatePath(`/admin-v2/run/${id}`)
    return { success: true, data: item, message: 'Run updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteRun(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await runService.delete(ids)
    revalidatePath('/admin-v2/run')
    return { success: true, message: 'Run(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRunOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await runService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
