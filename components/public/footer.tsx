import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Starter Blog</h3>
            <p className="text-sm text-muted-foreground">
              A modern blog platform built with Next.js 16.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Admin</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sign-in" className="text-muted-foreground hover:text-primary">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/admin-v2" className="text-muted-foreground hover:text-primary">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Starter Blog. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
