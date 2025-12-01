'use server'

import { contactService } from '@/lib/services/contact.service'
import type { ContactFormData } from '@/lib/schemas/contact.schema'
import { z } from 'zod'

export async function submitContactForm(data: ContactFormData) {
  try {
    const submission = await contactService.submitContactForm(data)

    return {
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      data: { id: submission.id },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        errors: error.issues,
      }
    }

    console.error('Contact form error:', error)
    return {
      success: false,
      error: 'Failed to submit form. Please try again.',
    }
  }
}
