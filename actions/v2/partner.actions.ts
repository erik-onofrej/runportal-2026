'use server'

import { revalidatePath } from 'next/cache'
import { partnerService } from '@/lib/admin-v2/services/partner.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllPartners(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await partnerService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getPartner(id: number): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await partnerService.get(id)
    if (!item) {
      return { success: false, error: 'Partner not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createPartner(data: Prisma.PartnerCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await partnerService.create(data)
    revalidatePath('/admin-v2/partner')
    return { success: true, data: item, message: 'Partner created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updatePartner(
  id: number,
  data: Prisma.PartnerUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await partnerService.update(id, data)
    revalidatePath('/admin-v2/partner')
    revalidatePath(`/admin-v2/partner/${id}`)
    return { success: true, data: item, message: 'Partner updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deletePartner(ids: number[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await partnerService.delete(ids)
    revalidatePath('/admin-v2/partner')
    return { success: true, message: 'Partner(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getPartnerOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await partnerService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
