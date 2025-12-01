'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UAParser } from 'ua-parser-js'

// Get current user from session
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('Not authenticated')
  }

  return session.user
}

// Get current session token
async function getCurrentSessionToken() {
  const headersList = await headers()
  const cookies = headersList.get('cookie') || ''

  // Extract session token from cookies
  const tokenMatch = cookies.match(/better-auth\.session_token=([^;]+)/)
  return tokenMatch ? tokenMatch[1] : null
}

export async function updateProfile(data: { name: string; image?: string }) {
  try {
    const user = await getCurrentUser()

    // Update user in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        ...(data.image && { image: data.image }),
      },
    })

    revalidatePath('/profile')
    return { success: true, message: 'Profile updated successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update profile'
    return { success: false, error: message }
  }
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  try {
    const user = await getCurrentUser()

    // Use Better Auth's changePassword API
    const result = await auth.api.changePassword({
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    })

    if (!result) {
      return { success: false, error: 'Failed to change password' }
    }

    return { success: true, message: 'Password changed successfully' }
  } catch (error: unknown) {
    // Better Auth throws errors for invalid current password
    const errorMessage = error instanceof Error ? error.message : 'Failed to change password'
    if (errorMessage.includes('Invalid password') || errorMessage.includes('current password')) {
      return { success: false, error: 'Current password is incorrect' }
    }
    return { success: false, error: errorMessage }
  }
}

export async function getUserSessions() {
  try {
    const user = await getCurrentUser()
    const currentToken = await getCurrentSessionToken()

    // Fetch all sessions for the user
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    })

    // Parse user agents and format sessions
    const formattedSessions = sessions.map((session) => {
      const parser = new UAParser(session.userAgent || '')
      const result = parser.getResult()

      return {
        id: session.id,
        browser: result.browser.name || 'Unknown Browser',
        browserVersion: result.browser.version || '',
        os: result.os.name || 'Unknown OS',
        osVersion: result.os.version || '',
        device: result.device.type || 'desktop',
        ipAddress: session.ipAddress || 'Unknown',
        lastActive: session.updatedAt,
        createdAt: session.createdAt,
        isCurrent: session.token === currentToken,
      }
    })

    return { success: true, sessions: formattedSessions }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sessions'
    return { success: false, error: message, sessions: [] }
  }
}

export async function revokeSession(sessionId: string) {
  try {
    const user = await getCurrentUser()
    const currentToken = await getCurrentSessionToken()

    // Verify session belongs to current user
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return { success: false, error: 'Session not found' }
    }

    if (session.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Prevent revoking current session
    if (session.token === currentToken) {
      return { success: false, error: 'Cannot revoke current session' }
    }

    // Delete session
    await prisma.session.delete({
      where: { id: sessionId },
    })

    revalidatePath('/profile')
    return { success: true, message: 'Session revoked successfully' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to revoke session'
    return { success: false, error: message }
  }
}

export async function revokeAllOtherSessions() {
  try {
    const user = await getCurrentUser()
    const currentToken = await getCurrentSessionToken()

    if (!currentToken) {
      return { success: false, error: 'Could not identify current session' }
    }

    // Delete all user sessions except current
    const result = await prisma.session.deleteMany({
      where: {
        userId: user.id,
        NOT: { token: currentToken },
      },
    })

    revalidatePath('/profile')
    return {
      success: true,
      message: `Revoked ${result.count} session(s)`,
      count: result.count,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to revoke sessions'
    return { success: false, error: message }
  }
}
