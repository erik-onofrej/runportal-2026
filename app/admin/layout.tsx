import { AdminSidebar } from '@/components/admin/sidebar'
import { UserButton } from '@/components/auth/user-button'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="ml-64 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-8">
          <div className="text-sm font-medium">Admin Dashboard</div>
          <UserButton />
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
