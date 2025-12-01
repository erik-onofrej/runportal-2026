'use server'

import { revalidatePath } from 'next/cache'
import { userService } from '@/lib/admin-v2/services/user.service'
import { requireAdmin } from '@/lib/admin-v2/utils/auth-helpers'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import type { Prisma } from '@prisma/client'

export async function getAllUsers(
  params: ServiceParams
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const result = await userService.getAll(params)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getUser(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await userService.get(id)
    if (!item) {
      return { success: false, error: 'User not found' }
    }
    return { success: true, data: item }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function createUser(data: Prisma.UserCreateInput): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await userService.create(data)
    revalidatePath('/admin-v2/user')
    return { success: true, data: item, message: 'User created successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function updateUser(
  id: string,
  data: Prisma.UserUpdateInput
): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const item = await userService.update(id, data)
    revalidatePath('/admin-v2/user')
    revalidatePath(`/admin-v2/user/${id}`)
    return { success: true, data: item, message: 'User updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function deleteUser(ids: string[]): Promise<ActionResponse> {
  try {
    await requireAdmin()
    await userService.delete(ids)
    revalidatePath('/admin-v2/user')
    return { success: true, message: 'User(s) deleted successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}

export async function getUserOptions(): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const options = await userService.getOptions()
    return { success: true, data: options }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return { success: false, error: message }
  }
}
