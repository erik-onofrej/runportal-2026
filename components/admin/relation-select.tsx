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
import { getRelationOptions } from '@/lib/admin-v2/actions/relation-options'

interface RelationOption {
  value: number | string
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
        const result = await getRelationOptions(modelName)

        if (result.success && Array.isArray(result.data)) {
          setOptions(result.data)
        } else {
          console.error('Error fetching relation options:', result.error)
          setOptions([])
        }
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
          <SelectItem key={option.value} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
