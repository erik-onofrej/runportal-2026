import { AdminV2Sidebar } from '@/components/admin/sidebar-v2'
import { UserButton } from '@/components/auth/user-button'

export default function AdminV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminV2Sidebar />
      <div className="ml-64 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-8">
          <div className="text-sm font-medium">Admin V2 Dashboard</div>
          <UserButton />
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
