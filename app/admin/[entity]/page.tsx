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

  useEffect(() => {
    if (!config) return
    fetchData()
  }, [config, page, debouncedSearch])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(config?.perPage || 10),
        search: debouncedSearch,
      })

      const response = await fetch(`/api/admin/${config?.name.toLowerCase()}?${params}`)
      const result = await response.json()

      setData(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await fetch(`/api/admin/${config?.name.toLowerCase()}/${id}`, {
        method: 'DELETE',
      })
      fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  if (!config) {
    return <div>Model not found</div>
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
              .map((item: Record<string, unknown>) => (item[relatedModelName] as Record<string, unknown>)?.[field.relation!.displayField])
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
      cell: ({ row }: { row: Row<Record<string, unknown>> }) => {
        const id = row.original.id as number
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/${entity}/${id}/edit`)}
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
          <Link href={`/admin/${entity}/new`}>
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
