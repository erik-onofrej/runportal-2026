'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldRendererProps } from '@/lib/admin/types'

interface RelationOption {
  id: number | string
  label: string
}

export function RelationSelect({ field, value, onChange }: FieldRendererProps) {
  const [options, setOptions] = useState<RelationOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!field.relation) return

    const fetchOptions = async () => {
      try {
        const modelName = field.relation!.model.toLowerCase()
        const displayField = field.relation!.displayField
        const response = await fetch(
          `/api/admin/${modelName}?relation=${field.name}&displayField=${displayField}`
        )
        const data = await response.json()
        setOptions(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching relation options:', err)
        setOptions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOptions()
  }, [field.relation, field.name])

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>
  }

  // Determine if this relation uses string or number IDs
  const idType = field.relation?.idType || 'number'

  return (
    <Select
      value={value ? String(value) : ''}
      onValueChange={(val) => {
        if (!val) {
          onChange(null)
        } else {
          // Convert to the appropriate type based on idType
          onChange(idType === 'string' ? val : parseInt(val, 10))
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={field.placeholder || `Select ${field.label}...`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
