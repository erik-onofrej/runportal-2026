import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

// Field types supported
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'          // Date only (no time)
  | 'datetime'      // Date with time
  | 'text'
  | 'email'
  | 'select'
  | 'radio'
  | 'checkbox-group'
  | 'file'
  | 'switch'
  | 'range'
  | 'relation'       // Many-to-one (belongsTo/foreign key)
  | 'relation-many'  // Many-to-many

// Relation configuration for relational fields
export interface RelationConfig {
  model: string              // Related model name (e.g., 'User', 'Category')
  displayField: string       // Field to show in dropdown (e.g., 'name', 'email')
  foreignKey?: string        // For many-to-one: foreign key field name (e.g., 'authorId')
  idType?: 'string' | 'number' // ID type of related model (default: 'number')
  joinTable?: string         // For many-to-many: join table model name (e.g., 'PostCategory')
  localKey?: string          // For many-to-many: local foreign key in join table (e.g., 'postId')
  foreignKeyRef?: string     // For many-to-many: related foreign key in join table (e.g., 'categoryId')
}

// Field configuration for each model property
export interface FieldConfig {
  name: string
  type: FieldType
  label: string

  // Validation
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp

  // UI behavior
  placeholder?: string
  helpText?: string
  defaultValue?: unknown

  // List display
  showInList?: boolean
  sortable?: boolean
  searchable?: boolean

  // Select field specific
  options?: { label: string; value: string | number }[]

  // File field specific
  accept?: string
  multiple?: boolean

  // Switch field specific
  switchLabel?: string

  // Range field specific
  step?: number

  // Relation field specific
  relation?: RelationConfig

  // Custom rendering (override defaults)
  customRenderer?: React.ComponentType<FieldRendererProps>
  customListRenderer?: (value: unknown, row?: Record<string, unknown>) => ReactNode

  // Permissions
  readonly?: boolean
  hideInCreate?: boolean
  hideInEdit?: boolean
}

// Props passed to custom field renderers
export interface FieldRendererProps {
  field: FieldConfig
  value: unknown
  onChange: (value: unknown) => void
  error?: string
}

// Filter types for list view filtering
export type FilterType = 'relation-select' | 'select' | 'date-range' | 'boolean'

// Filter configuration for list view
export interface FilterConfig {
  name: string                    // Filter identifier (e.g., 'eventId', 'regionId')
  type: FilterType                // Type of filter component to render
  label: string                   // Display label for the filter
  placeholder?: string            // Placeholder text for the filter

  // For relation-select filters
  relation?: {
    model: string                 // Related model name (e.g., 'Event', 'Region')
    optionsAction: string         // Action function name to fetch options (e.g., 'getEventOptions')
  }

  // For select filters
  options?: { label: string; value: string | number }[]

  // Field to filter on in the database (if different from name)
  filterField?: string
}

// Model configuration
export interface ModelConfig {
  // Model identification
  name: string                    // DB model name (PascalCase)
  namePlural: string              // Display name plural
  nameSingular: string            // Display name singular

  // UI
  icon: LucideIcon
  description?: string
  primaryField: string            // Field to use as display label
  group?: string                  // Menu group category

  // Fields
  fields: FieldConfig[]

  // List view configuration
  defaultSort?: { field: string; direction: 'asc' | 'desc' }
  searchFields?: string[]         // Fields to search in
  perPage?: number                // Items per page (default: 10)
  filters?: FilterConfig[]        // Filters for list view

  // Permissions (for future extension)
  permissions?: {
    create?: boolean
    read?: boolean
    update?: boolean
    delete?: boolean
  }

  // Hooks for custom logic (future)
  beforeCreate?: (data: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>
  beforeUpdate?: (data: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>
  afterCreate?: (record: Record<string, unknown>) => Promise<void> | void
  afterUpdate?: (record: Record<string, unknown>) => Promise<void> | void
}

// Global admin configuration
export interface AdminConfig {
  models: ModelConfig[]
  title?: string
  basePath?: string
}
