'use server'

import { revalidatePath } from 'next/cache'
import { runnerService } from '@/lib/admin-v2/services/runner.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllRunners(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await runnerService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRunner(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runnerService.get(id)
    if (!item) {
      return { success: false, error: 'Runner not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createRunner(data: Prisma.RunnerCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runnerService.create(data)
    revalidatePath('/admin-v2/runner')
    return { success: true, data: item, message: 'Runner created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateRunner(
  id: string,
  data: Prisma.RunnerUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await runnerService.update(id, data)
    revalidatePath('/admin-v2/runner')
    revalidatePath(`/admin-v2/runner/${id}`)
    return { success: true, data: item, message: 'Runner updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteRunner(ids: string[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await runnerService.delete(ids)
    revalidatePath('/admin-v2/runner')
    return { success: true, message: 'Runner(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getRunnerOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await runnerService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
