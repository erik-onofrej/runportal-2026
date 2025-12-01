import { z } from 'zod'
import { FieldConfig, ModelConfig } from './types'

/**
 * Generate Zod schema from field configuration
 */
export function generateFieldSchema(field: FieldConfig): z.ZodTypeAny {
  let schema: z.ZodTypeAny

  // Base type
  switch (field.type) {
    case 'string':
    case 'email':
    case 'text':
      schema = z.string({
        message: `${field.label} is required`,
      })
      if (field.min) {
        schema = (schema as z.ZodString).min(field.min, {
          message: `${field.label} must be at least ${field.min} characters`,
        })
      }
      if (field.max) {
        schema = (schema as z.ZodString).max(field.max, {
          message: `${field.label} must be at most ${field.max} characters`,
        })
      }
      if (field.type === 'email') {
        schema = (schema as z.ZodString).email({
          message: `Please enter a valid email address`,
        })
      }
      if (field.pattern) {
        schema = (schema as z.ZodString).regex(field.pattern, {
          message: `${field.label} format is invalid`,
        })
      }
      break

    case 'number':
      schema = z.coerce.number({
        message: `${field.label} must be a valid number`,
      })
      if (field.min !== undefined) {
        schema = (schema as z.ZodNumber).min(field.min, {
          message: `${field.label} must be at least ${field.min}`,
        })
      }
      if (field.max !== undefined) {
        schema = (schema as z.ZodNumber).max(field.max, {
          message: `${field.label} must be at most ${field.max}`,
        })
      }
      break

    case 'boolean':
      schema = z.boolean({
        message: `${field.label} must be true or false`,
      })
      break

    case 'date':
    case 'datetime':
      schema = z.coerce.date({
        message: `Please enter a valid date for ${field.label}`,
      })
      break

    case 'select':
      if (field.options && field.options.length > 0) {
        const values = field.options.map((opt) => opt.value)
        schema = z.enum(values as [string, ...string[]], {
          message: `Please select a valid ${field.label.toLowerCase()}`,
        })
      } else {
        schema = z.string({
          message: `Please select a ${field.label.toLowerCase()}`,
        })
      }
      break

    case 'relation':
      // Many-to-one: validate based on the relation's ID type
      const idType = field.relation?.idType || 'number'

      if (idType === 'string') {
        schema = z.string({
          message: `Please select ${field.label.toLowerCase()}`,
        }).min(1, {
          message: `Please select ${field.label.toLowerCase()}`,
        })
      } else {
        schema = z.coerce.number({
          message: `Please select ${field.label.toLowerCase()}`,
        }).int({
          message: `Please select ${field.label.toLowerCase()}`,
        }).positive({
          message: `Please select ${field.label.toLowerCase()}`,
        })
      }
      break

    case 'relation-many':
      // Many-to-many: validate as array of IDs (string or number based on relation config)
      const manyIdType = field.relation?.idType || 'number'

      if (manyIdType === 'string') {
        schema = z.array(z.string().min(1)).default([])
      } else {
        schema = z.array(z.coerce.number().int().positive()).default([])
      }
      break

    default:
      schema = z.any()
  }

  // Make optional if not required
  if (!field.required && !field.defaultValue) {
    schema = schema.optional()
  }

  return schema
}

/**
 * Generate complete Zod schema for model
 */
export function generateModelSchema(
  config: ModelConfig,
  mode: 'create' | 'update' = 'create'
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of config.fields) {
    // Skip readonly fields
    if (field.readonly) continue

    // Skip fields hidden in create/edit
    if (mode === 'create' && field.hideInCreate) continue
    if (mode === 'update' && field.hideInEdit) continue

    shape[field.name] = generateFieldSchema(field)
  }

  return z.object(shape)
}

/**
 * Validate data against model schema
 */
export function validateModelData(
  config: ModelConfig,
  data: unknown,
  mode: 'create' | 'update' = 'create'
): { success: true; data: Record<string, unknown> } | { success: false; errors: Record<string, string> } {
  const schema = generateModelSchema(config, mode)

  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      for (const issue of error.issues) {
        const path = issue.path.join('.')
        errors[path] = issue.message
      }
      return { success: false, errors }
    }
    return { success: false, errors: { _general: 'Validation failed' } }
  }
}
