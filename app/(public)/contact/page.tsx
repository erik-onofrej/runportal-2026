import { ContactForm } from '@/components/public/contact-form'
import Image from 'next/image'

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with us',
}

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Get In Touch</h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Have a question about an event, registration, or partnership? We'd love to hear from you.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left Column - Contact Form */}
          <div>
            <ContactForm />
          </div>

          {/* Right Column - Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg lg:aspect-auto">
            <Image
              src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=900&fit=crop"
              alt="Running event"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
