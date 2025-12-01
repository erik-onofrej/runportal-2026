'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getModelConfig } from '@/lib/admin/config'
import { Button } from '@/components/ui/button'
import { DataTable, SortableHeader } from '@/components/admin/data-table'
import { DataTableToolbar } from '@/components/admin/data-table-toolbar'
import { DataTablePagination } from '@/components/admin/data-table-pagination'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { ColumnDef, Column, Row } from '@tanstack/react-table'
import { useDebounce } from '@/hooks/use-debounce'

// Import server actions dynamically based on entity
import { getAllUsers, deleteUser } from '@/actions/v2/user.actions'
import { getAllBlogs, deleteBlog } from '@/actions/v2/blog.actions'
import { getAllCategories, deleteCategory } from '@/actions/v2/category.actions'
import { getAllGalleries, deleteGallery } from '@/actions/v2/gallery.actions'
import { getAllGalleryImages, deleteGalleryImage } from '@/actions/v2/galleryImage.actions'
import { getAllContactSubmissions, deleteContactSubmission } from '@/actions/v2/contactSubmission.actions'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'

// Map entity names to their actions
const actionsMap: Record<string, {
  getAll: (params: ServiceParams) => Promise<ActionResponse>
  delete: (ids: (number | string)[]) => Promise<ActionResponse>
}> = {
  user: { getAll: getAllUsers, delete: deleteUser as (ids: (number | string)[]) => Promise<ActionResponse> },
  blog: { getAll: getAllBlogs, delete: deleteBlog as (ids: (number | string)[]) => Promise<ActionResponse> },
  category: { getAll: getAllCategories, delete: deleteCategory as (ids: (number | string)[]) => Promise<ActionResponse> },
  gallery: { getAll: getAllGalleries, delete: deleteGallery as (ids: (number | string)[]) => Promise<ActionResponse> },
  galleryimage: { getAll: getAllGalleryImages, delete: deleteGalleryImage as (ids: (number | string)[]) => Promise<ActionResponse> },
  contactsubmission: { getAll: getAllContactSubmissions, delete: deleteContactSubmission as (ids: (number | string)[]) => Promise<ActionResponse> },
}

export default function EntityListPage({
  params,
}: {
  params: Promise<{ entity: string }>
}) {
  const { entity } = use(params)
  const router = useRouter()
  const config = getModelConfig(entity)

  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const debouncedSearch = useDebounce(search, 300)

  const actions = actionsMap[entity]

  useEffect(() => {
    if (!config || !actions) return
    fetchData()
  }, [config, page, debouncedSearch])

  const fetchData = async () => {
    if (!actions) return

    setIsLoading(true)
    try {
      const result = await actions.getAll({
        pagination: {
          page,
          pageSize: config?.perPage || 10,
        },
        search: {
          query: debouncedSearch,
        },
      })

      if (result.success && result.data) {
        setData(result.data.data)
        setTotal(result.data.pagination?.total || 0)
        setTotalPages(result.data.pagination?.totalPages || 1)
      } else {
        console.error('Error fetching data:', result.error)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    if (!actions) return

    try {
      const result = await actions.delete([id])
      if (result.success) {
        fetchData()
      } else {
        console.error('Error deleting:', result.error)
        alert(result.error || 'Failed to delete')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to delete')
    }
  }

  if (!config) {
    return <div>Model not found</div>
  }

  if (!actions) {
    return <div>Actions not found for {entity}</div>
  }

  // Build columns from config
  const columns: ColumnDef<Record<string, unknown>>[] = [
    ...config.fields
      .filter((field) => field.showInList)
      .map((field) => ({
        accessorKey: field.name,
        header: field.sortable
          ? ({ column }: { column: Column<Record<string, unknown>> }) => (
              <SortableHeader column={column}>{field.label}</SortableHeader>
            )
          : field.label,
        cell: ({ row }: { row: Row<Record<string, unknown>> }) => {
          const value = row.getValue(field.name)

          // Use custom list renderer if provided
          if (field.customListRenderer) {
            return field.customListRenderer(value)
          }

          // Handle many-to-one relation
          if (field.type === 'relation' && value && typeof value === 'object' && field.relation) {
            const displayValue = (value as Record<string, unknown>)[field.relation.displayField]
            return String(displayValue || '-')
          }

          // Handle many-to-many relation
          if (field.type === 'relation-many' && field.relation?.joinTable) {
            const relatedModelName =
              field.relation.model.charAt(0).toLowerCase() +
              field.relation.model.slice(1)

            const items = row.original[field.name]
            if (!items || !Array.isArray(items)) return '-'

            const labels = items
              .map((item: Record<string, unknown>) => {
                const relatedItem = item[relatedModelName] as Record<string, unknown> | undefined
                return relatedItem?.[field.relation!.displayField]
              })
              .filter(Boolean)

            return labels.length > 0 ? labels.join(', ') : '-'
          }

          // Default rendering
          if (field.type === 'boolean') {
            return value ? 'Yes' : 'No'
          }
          if (field.type === 'date' && value) {
            return new Date(value as string | number | Date).toLocaleDateString()
          }
          return String(value || '-')
        },
      })),
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const id = row.original.id as number | string
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin-v2/${entity}/${id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{config.namePlural}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        <Button asChild>
          <Link href={`/admin-v2/${entity}/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add {config.nameSingular}
          </Link>
        </Button>
      </div>

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        onClearSearch={() => {
          setSearch('')
          setPage(1)
        }}
      />

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <DataTable columns={columns} data={data} />
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            perPage={config.perPage || 10}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
