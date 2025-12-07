'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ModelConfig } from '@/lib/admin/types'
import { generateModelSchema } from '@/lib/admin/schema-generator'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { RelationSelect } from './relation-select'
import { RelationMultiSelect } from './relation-multi-select'
import { DatePicker } from '@/components/ui/date-picker'

interface GenericFormProps {
  config: ModelConfig
  mode: 'create' | 'edit'
  defaultValues?: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}

export function GenericForm({
  config,
  mode,
  defaultValues = {},
  onSubmit,
  onCancel,
}: GenericFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize default values for all fields to prevent controlled/uncontrolled input errors
  const initializeDefaultValues = () => {
    const initialized = { ...defaultValues }

    config.fields.forEach((field) => {
      if (!(field.name in initialized)) {
        // Use field's defaultValue if provided, otherwise use type-appropriate empty value
        if (field.defaultValue !== undefined) {
          initialized[field.name] = field.defaultValue
        } else {
          switch (field.type) {
            case 'boolean':
              initialized[field.name] = false
              break
            case 'number':
              initialized[field.name] = 0
              break
            case 'date':
            case 'datetime':
              // Don't initialize date fields - leave as undefined
              break
            case 'relation':
              // Don't initialize relation fields - leave as undefined
              // This prevents validation errors for required relations
              break
            case 'relation-many':
              initialized[field.name] = []
              break
            default:
              initialized[field.name] = ''
          }
        }
      }
    })

    return initialized
  }

  const schema = generateModelSchema(config, mode === 'edit' ? 'update' : mode)
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initializeDefaultValues(),
  })

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get fields to display
  const fields = config.fields.filter((field) => {
    if (field.readonly) return false
    if (mode === 'create' && field.hideInCreate) return false
    if (mode === 'edit' && field.hideInEdit) return false
    return true
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {fields.map((fieldConfig) => (
          <FormField
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldConfig.label}</FormLabel>
                <FormControl>
                  {renderField(fieldConfig, field)}
                </FormControl>
                {fieldConfig.helpText && (
                  <FormDescription>{fieldConfig.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

function renderField(
  fieldConfig: import('@/lib/admin/types').FieldConfig,
  field: { value: unknown; onChange: (value: unknown) => void }
) {
  // Use custom renderer if provided
  if (fieldConfig.customRenderer) {
    const CustomRenderer = fieldConfig.customRenderer
    return (
      <CustomRenderer
        field={fieldConfig}
        value={field.value}
        onChange={field.onChange}
      />
    )
  }

  // Default renderers
  switch (fieldConfig.type) {
    case 'relation':
      return (
        <RelationSelect
          field={fieldConfig}
          value={field.value}
          onChange={field.onChange}
        />
      )

    case 'relation-many':
      return (
        <RelationMultiSelect
          field={fieldConfig}
          value={field.value}
          onChange={field.onChange}
        />
      )

    case 'text':
      return (
        <Textarea
          placeholder={fieldConfig.placeholder}
          value={(field.value as string) ?? ''}
          onChange={(e) => field.onChange(e.target.value)}
          rows={5}
        />
      )

    case 'boolean':
      return (
        <Checkbox
          checked={field.value as boolean}
          onCheckedChange={field.onChange}
        />
      )

    case 'select':
      return (
        <Select onValueChange={field.onChange} value={(field.value as string) || ''}>
          <SelectTrigger>
            <SelectValue placeholder={fieldConfig.placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {fieldConfig.options?.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'radio':
      return (
        <RadioGroup
          onValueChange={field.onChange}
          value={(field.value as string) || ''}
          className="flex flex-col space-y-2"
        >
          {fieldConfig.options?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={String(option.value)} id={`${fieldConfig.name}-${option.value}`} />
              <Label htmlFor={`${fieldConfig.name}-${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )

    case 'checkbox-group':
      return (
        <div className="flex flex-col space-y-2">
          {fieldConfig.options?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${fieldConfig.name}-${option.value}`}
                checked={(field.value as (string | number)[] || []).includes(option.value)}
                onCheckedChange={(checked) => {
                  const currentValue = (field.value as (string | number)[]) || []
                  if (checked) {
                    field.onChange([...currentValue, option.value])
                  } else {
                    field.onChange(currentValue.filter((v) => v !== option.value))
                  }
                }}
              />
              <Label htmlFor={`${fieldConfig.name}-${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      )

    case 'file':
      return (
        <Input
          type="file"
          accept={fieldConfig.accept}
          multiple={fieldConfig.multiple}
          onChange={(e) => {
            const files = e.target.files
            if (files) {
              field.onChange(fieldConfig.multiple ? Array.from(files) : files[0])
            }
          }}
        />
      )

    case 'switch':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={field.value as boolean}
            onCheckedChange={field.onChange}
          />
          {fieldConfig.switchLabel && (
            <Label className="font-normal">{fieldConfig.switchLabel}</Label>
          )}
        </div>
      )

    case 'range':
      return (
        <div className="space-y-2">
          <Slider
            min={fieldConfig.min ?? 0}
            max={fieldConfig.max ?? 100}
            step={fieldConfig.step ?? 1}
            value={Array.isArray(field.value) ? field.value : [field.value]}
            onValueChange={field.onChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{fieldConfig.min ?? 0}</span>
            <span className="font-medium text-foreground">
              {Array.isArray(field.value) ? field.value[0] : field.value}
            </span>
            <span>{fieldConfig.max ?? 100}</span>
          </div>
        </div>
      )

    case 'date':
      return (
        <DatePicker
          value={field.value ? new Date(field.value as string | number | Date) : null}
          onChange={(date) => field.onChange(date)}
          placeholder={fieldConfig.placeholder || 'Select date'}
          showTime={false}
        />
      )

    case 'datetime':
      return (
        <DatePicker
          value={field.value ? new Date(field.value as string | number | Date) : null}
          onChange={(date) => field.onChange(date)}
          placeholder={fieldConfig.placeholder || 'Select date and time'}
          showTime={true}
        />
      )

    case 'number':
      return (
        <Input
          type="number"
          placeholder={fieldConfig.placeholder}
          value={field.value ?? ''}
          onChange={(e) => field.onChange(parseFloat(e.target.value))}
        />
      )

    case 'email':
      return (
        <Input
          type="email"
          placeholder={fieldConfig.placeholder}
          value={(field.value as string) ?? ''}
          onChange={(e) => field.onChange(e.target.value)}
        />
      )

    default:
      return (
        <Input
          type="text"
          placeholder={fieldConfig.placeholder}
          value={(field.value as string) ?? ''}
          onChange={(e) => field.onChange(e.target.value)}
        />
      )
  }
}
