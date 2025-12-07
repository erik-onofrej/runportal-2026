'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { FieldRendererProps } from '@/lib/admin/types'
import { getRelationOptions } from '@/lib/admin-v2/actions/relation-options'

interface RelationOption {
  value: number | string
  label: string
}

export function RelationMultiSelect({ field, value, onChange }: FieldRendererProps) {
  const [options, setOptions] = useState<RelationOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const selectedIds: (number | string)[] = Array.isArray(value) ? value : []

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

  const toggleSelection = (optionValue: number | string) => {
    const newSelection = selectedIds.includes(optionValue)
      ? selectedIds.filter((id) => id !== optionValue)
      : [...selectedIds, optionValue]
    onChange(newSelection)
  }

  const selectedLabels = options
    .filter((opt) => selectedIds.includes(opt.value))
    .map((opt) => opt.label)

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            {selectedLabels.length > 0
              ? `${selectedLabels.length} selected`
              : field.placeholder || `Select ${field.label}...`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full" align="start">
          {options.map((option) => {
            const isSelected = selectedIds.includes(option.value)
            return (
              <DropdownMenuItem
                key={option.value}
                onSelect={(e) => {
                  e.preventDefault()
                  toggleSelection(option.value)
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-4 w-4 border rounded flex items-center justify-center',
                      isSelected && 'bg-primary border-primary'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span>{option.label}</span>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedLabels.map((label, index) => (
            <Badge key={index} variant="secondary">
              {label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
