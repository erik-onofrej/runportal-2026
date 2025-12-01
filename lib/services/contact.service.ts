import prisma from '@/lib/prisma'
import { contactFormSchema, type ContactFormData } from '@/lib/schemas/contact.schema'

export const contactService = {
  async submitContactForm(data: ContactFormData) {
    // Validate
    const validated = contactFormSchema.parse(data)

    // Create submission
    const submission = await prisma.contactSubmission.create({
      data: {
        name: validated.name,
        email: validated.email,
        subject: validated.subject || null,
        message: validated.message,
        status: 'new',
      },
    })

    // TODO: Optional - Send email notification to admin
    // await sendContactNotification(submission)

    return submission
  },
}
