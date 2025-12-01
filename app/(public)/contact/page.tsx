import { ContactForm } from '@/components/public/contact-form'

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with us',
}

export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Have a question? We'd love to hear from you.
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  )
}
