'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    throw new Error('Not authenticated')
  }
  return session.user
}

export async function requireAuth() {
  return getCurrentUser()
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }
  return user
}

export async function hasRole(role: string) {
  try {
    const user = await getCurrentUser()
    return user.role === role
  } catch {
    return false
  }
}
