'use server'

import { revalidatePath } from 'next/cache'
import { [MODEL_CAMEL]Service } from '@/lib/admin-v2/services/[MODEL].service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAll[ENTITY_PLURAL](
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await [MODEL_CAMEL]Service.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function get[ENTITY](id: [ID_TYPE]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await [MODEL_CAMEL]Service.get(id)
    if (!item) {
      return { success: false, error: '[ENTITY] not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function create[ENTITY](data: Prisma.[ENTITY]CreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await [MODEL_CAMEL]Service.create(data)
    revalidatePath('/admin-v2/[MODEL]')
    return { success: true, data: item, message: '[ENTITY] created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function update[ENTITY](
  id: [ID_TYPE],
  data: Prisma.[ENTITY]UpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await [MODEL_CAMEL]Service.update(id, data)
    revalidatePath('/admin-v2/[MODEL]')
    revalidatePath(`/admin-v2/[MODEL]/${id}`)
    return { success: true, data: item, message: '[ENTITY] updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function delete[ENTITY](ids: [ID_TYPE][]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await [MODEL_CAMEL]Service.delete(ids)
    revalidatePath('/admin-v2/[MODEL]')
    return { success: true, message: '[ENTITY](s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function get[ENTITY]Options(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await [MODEL_CAMEL]Service.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
