'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getAllModelConfigs } from '@/lib/admin/config'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth-client'
import { LayoutDashboard } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function AdminV2Sidebar() {
  const pathname = usePathname()
  const models = getAllModelConfigs()
  const { data: session, isPending } = useSession()

  // Group models by their group property
  const groupedModels = models.reduce((acc, model) => {
    const group = model.group || 'Other'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(model)
    return acc
  }, {} as Record<string, typeof models>)

  // Define group order
  const groupOrder = ['System', 'Content', 'Locations', 'Events', 'Runs', 'Participants', 'Other']
  const sortedGroups = groupOrder.filter(group => groupedModels[group])

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">Admin V2</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {/* Dashboard link */}
          <Link
            href="/admin-v2"
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === '/admin-v2'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          {/* Grouped Model links */}
          {sortedGroups.map((groupName, groupIndex) => (
            <div key={groupName} className={cn(groupIndex > 0 && 'mt-6')}>
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {groupName}
              </h3>
              <div className="space-y-1">
                {groupedModels[groupName].map((model) => {
                  const Icon = model.icon
                  const entityPath = `/admin-v2/${model.name.toLowerCase()}`
                  // Match exact path or path with trailing segments (e.g., /admin-v2/gallery/123)
                  // This prevents /admin-v2/galleryimage from matching /admin-v2/gallery
                  const isActive = pathname === entityPath || pathname.startsWith(entityPath + '/')

                  return (
                    <Link
                      key={model.name}
                      href={entityPath}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{model.namePlural}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          {isPending ? (
            <Skeleton className="h-10 w-full" />
          ) : session ? (
            <div className="space-y-1">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not signed in</p>
          )}
        </div>
      </div>
    </aside>
  )
}
