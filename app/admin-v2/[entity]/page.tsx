'use client'

import { use, useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { getAllContactSubmissions, deleteContactSubmission } from '@/actions/v2/contactSubmission.actions'
// Running Events Actions
import { getAllRegions, deleteRegion } from '@/actions/v2/region.actions'
import { getAllDistricts, deleteDistrict } from '@/actions/v2/district.actions'
import { getAllLocations, deleteLocation } from '@/actions/v2/location.actions'
import { getAllOrganizers, deleteOrganizer } from '@/actions/v2/organizer.actions'
import { getAllEvents, deleteEvent } from '@/actions/v2/event.actions'
import { getAllRuns, deleteRun } from '@/actions/v2/run.actions'
import { getAllRunCategories, deleteRunCategory } from '@/actions/v2/runCategory.actions'
import { getAllRunEntryFees, deleteRunEntryFee } from '@/actions/v2/runEntryFee.actions'
import { getAllEventSchedules, deleteEventSchedule } from '@/actions/v2/eventSchedule.actions'
import { getAllPartners, deletePartner } from '@/actions/v2/partner.actions'
import { getAllEventAttachments, deleteEventAttachment } from '@/actions/v2/eventAttachment.actions'
import { getAllRegistrations, deleteRegistration } from '@/actions/v2/registration.actions'
import { getAllRunResults, deleteRunResult } from '@/actions/v2/runResult.actions'
import type { ServiceParams } from '@/lib/admin-v2/types/service.types'
import type { ActionResponse } from '@/lib/admin-v2/types/action.types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Map entity names to their actions
const actionsMap: Record<string, {
  getAll: (params: ServiceParams) => Promise<ActionResponse>
  delete: (ids: (number | string)[]) => Promise<ActionResponse>
}> = {
  user: { getAll: getAllUsers, delete: deleteUser as (ids: (number | string)[]) => Promise<ActionResponse> },
  blog: { getAll: getAllBlogs, delete: deleteBlog as (ids: (number | string)[]) => Promise<ActionResponse> },
  category: { getAll: getAllCategories, delete: deleteCategory as (ids: (number | string)[]) => Promise<ActionResponse> },
  contactsubmission: { getAll: getAllContactSubmissions, delete: deleteContactSubmission as (ids: (number | string)[]) => Promise<ActionResponse> },
  // Running Events
  region: { getAll: getAllRegions, delete: deleteRegion as (ids: (number | string)[]) => Promise<ActionResponse> },
  district: { getAll: getAllDistricts, delete: deleteDistrict as (ids: (number | string)[]) => Promise<ActionResponse> },
  location: { getAll: getAllLocations, delete: deleteLocation as (ids: (number | string)[]) => Promise<ActionResponse> },
  organizer: { getAll: getAllOrganizers, delete: deleteOrganizer as (ids: (number | string)[]) => Promise<ActionResponse> },
  event: { getAll: getAllEvents, delete: deleteEvent as (ids: (number | string)[]) => Promise<ActionResponse> },
  run: { getAll: getAllRuns, delete: deleteRun as (ids: (number | string)[]) => Promise<ActionResponse> },
  runcategory: { getAll: getAllRunCategories, delete: deleteRunCategory as (ids: (number | string)[]) => Promise<ActionResponse> },
  runentryfee: { getAll: getAllRunEntryFees, delete: deleteRunEntryFee as (ids: (number | string)[]) => Promise<ActionResponse> },
  eventschedule: { getAll: getAllEventSchedules, delete: deleteEventSchedule as (ids: (number | string)[]) => Promise<ActionResponse> },
  partner: { getAll: getAllPartners, delete: deletePartner as (ids: (number | string)[]) => Promise<ActionResponse> },
  eventattachment: { getAll: getAllEventAttachments, delete: deleteEventAttachment as (ids: (number | string)[]) => Promise<ActionResponse> },
  registration: { getAll: getAllRegistrations, delete: deleteRegistration as (ids: (number | string)[]) => Promise<ActionResponse> },
  runresult: { getAll: getAllRunResults, delete: deleteRunResult as (ids: (number | string)[]) => Promise<ActionResponse> },
}

export default function EntityListPage({
  params,
}: {
  params: Promise<{ entity: string }>
}) {
  const { entity } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const config = getModelConfig(entity)

  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  // Dynamic filter states
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [filterOptions, setFilterOptions] = useState<Record<string, Array<{ value: number; label: string }>>>({})
  const [filtersInitialized, setFiltersInitialized] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  const actions = actionsMap[entity]

  // Reset data when entity changes to prevent stale data issues
  useEffect(() => {
    setData([])
    setPage(1)
    setSearch('')
    setFilterValues({})
    setFilterOptions({})
    setFiltersInitialized(false)
  }, [entity])

  // Initialize filters from query parameters
  useEffect(() => {
    if (filtersInitialized) return

    // If no filters configured, mark as initialized immediately
    if (!config?.filters) {
      setFiltersInitialized(true)
      return
    }

    const initialFilters: Record<string, string> = {}
    config.filters.forEach((filter) => {
      const paramValue = searchParams.get(filter.name)
      if (paramValue) {
        initialFilters[filter.name] = paramValue
      }
    })

    if (Object.keys(initialFilters).length > 0) {
      setFilterValues(initialFilters)
    }
    setFiltersInitialized(true)
  }, [config, searchParams, filtersInitialized])

  // Load filter options dynamically based on config
  useEffect(() => {
    if (!config || !config.filters) return
    loadFilterOptions()
  }, [entity, config])

  useEffect(() => {
    if (!config || !actions || !filtersInitialized) return
    fetchData()
  }, [config, page, debouncedSearch, filterValues, filtersInitialized])

  const loadFilterOptions = async () => {
    if (!config?.filters) return

    for (const filter of config.filters) {
      if (filter.type === 'relation-select' && filter.relation) {
        try {
          // Dynamically import and call the options action
          const optionsAction = await import(`@/actions/v2/${filter.relation.model.toLowerCase()}.actions`).then(
            (mod) => mod[filter.relation!.optionsAction]
          )

          const result = await optionsAction()
          if (result.success && result.data) {
            setFilterOptions((prev) => ({
              ...prev,
              [filter.name]: result.data,
            }))
          }
        } catch (error) {
          console.error(`Error loading options for filter ${filter.name}:`, error)
        }
      }
    }
  }

  const fetchData = async () => {
    if (!actions) return

    setIsLoading(true)
    try {
      // Build filters dynamically from filterValues
      const filters: Record<string, any> = {}

      Object.entries(filterValues).forEach(([key, value]) => {
        if (value && value !== 'all') {
          // Parse as integer for relation filters
          const filterConfig = config?.filters?.find(f => f.name === key)
          if (filterConfig?.type === 'relation-select') {
            filters[key] = parseInt(value)
          } else {
            filters[key] = value
          }
        }
      })

      const result = await actions.getAll({
        pagination: {
          page,
          pageSize: config?.perPage || 10,
        },
        search: {
          query: debouncedSearch,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
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

  // Build columns from config - memoized to prevent table reinitializations
  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(() => [
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
            return field.customListRenderer(value, row.original)
          }

          // Handle many-to-one relation
          if (field.type === 'relation' && field.relation) {
            // Access the relation by model name (e.g., 'region') not the foreign key (e.g., 'regionId')
            const relatedModelName = field.relation.model.charAt(0).toLowerCase() + field.relation.model.slice(1)
            const relatedObject = row.original[relatedModelName] as Record<string, unknown> | undefined
            if (relatedObject) {
              const displayValue = relatedObject[field.relation.displayField]
              return String(displayValue || '-')
            }
            return '-'
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
  ], [config, entity, router])

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
          setFilterValues({})
          setPage(1)
        }}
      >
        {config.filters?.map((filter) => {
          if (filter.type === 'relation-select') {
            const options = filterOptions[filter.name] || []
            return (
              <Select
                key={filter.name}
                value={filterValues[filter.name] || 'all'}
                onValueChange={(value) => {
                  setFilterValues((prev) => ({ ...prev, [filter.name]: value }))
                  setPage(1)
                }}
              >
                <SelectTrigger size="sm" className="h-8 w-auto min-w-[180px] max-w-[400px]">
                  <SelectValue placeholder={filter.placeholder || filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.relation?.model}s</SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }
          return null
        })}
      </DataTableToolbar>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <DataTable key={entity} columns={columns} data={data} />
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
