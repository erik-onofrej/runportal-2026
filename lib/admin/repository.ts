import prisma from '@/lib/prisma'
import { ModelConfig, FieldConfig, RelationConfig } from './types'

export interface ListParams {
  page?: number
  perPage?: number
  search?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface ListResult<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

/**
 * Generic repository for CRUD operations
 */
export class GenericRepository<T = any> {
  private modelName: string
  private config: ModelConfig

  constructor(config: ModelConfig) {
    this.config = config
    this.modelName = config.name.charAt(0).toLowerCase() + config.name.slice(1)
  }

  /**
   * Get Prisma delegate for this model
   */
  private getDelegate() {
    return (prisma as any)[this.modelName]
  }

  /**
   * Get relation fields from config
   */
  private getRelationFields(): FieldConfig[] {
    return this.config.fields.filter(
      (f) => f.type === 'relation' || f.type === 'relation-many'
    )
  }

  /**
   * Build Prisma include object for loading relations
   */
  private buildInclude(): Record<string, boolean | object> {
    const include: Record<string, boolean | object> = {}

    for (const field of this.getRelationFields()) {
      if (field.type === 'relation' && field.relation) {
        // Many-to-one: include the related object
        const relationName = field.name
        include[relationName] = true
      } else if (field.type === 'relation-many' && field.relation?.joinTable) {
        // Many-to-many: include using the Prisma relation field name with nested include
        const relatedModelName =
          field.relation.model.charAt(0).toLowerCase() + field.relation.model.slice(1)

        include[field.name] = {
          include: {
            [relatedModelName]: true,
          },
        }
      }
    }

    return include
  }

  /**
   * Transform form data (IDs) to Prisma create/update syntax
   */
  private transformFormDataToPrisma(data: Record<string, unknown>, mode: 'create' | 'update' = 'create'): Record<string, unknown> {
    const transformed: Record<string, unknown> = { ...data }

    for (const field of this.getRelationFields()) {
      const value = data[field.name]

      if (field.type === 'relation' && field.relation) {
        // Many-to-one: use direct foreign key
        delete transformed[field.name]
        const foreignKey = field.relation.foreignKey
        if (foreignKey && value !== undefined && value !== null && value !== '') {
          // Keep the value as-is if it's already the correct type
          // String IDs stay as strings, number IDs can be parsed
          const idType = field.relation.idType || 'number'
          if (idType === 'string') {
            transformed[foreignKey] = String(value)
          } else {
            transformed[foreignKey] = typeof value === 'string' ? parseInt(value, 10) : value
          }
        }
      } else if (field.type === 'relation-many' && field.relation?.joinTable) {
        // Many-to-many: use nested create on relation field
        delete transformed[field.name]

        const ids = Array.isArray(value) ? value : []
        const foreignKeyRef = field.relation.foreignKeyRef
        const idType = field.relation.idType || 'number'

        if (ids.length > 0 && foreignKeyRef) {
          transformed[field.name] = {
            create: ids.map((id: string | number) => ({
              [foreignKeyRef]: idType === 'string' ? String(id) : (typeof id === 'string' ? parseInt(id, 10) : id),
            })),
          }
        }
      }
    }

    return transformed
  }

  /**
   * Transform Prisma data (with relations) to form data (IDs)
   * PUBLIC method - used by API routes
   */
  public transformPrismaToFormData(data: Record<string, unknown>): Record<string, unknown> {
    const transformed: Record<string, unknown> = { ...data }

    for (const field of this.getRelationFields()) {
      if (field.type === 'relation' && field.relation) {
        // Many-to-one: extract ID from related object
        const relatedObj = data[field.name]
        if (relatedObj && typeof relatedObj === 'object') {
          transformed[field.name] = (relatedObj as Record<string, unknown>).id
        }
      } else if (field.type === 'relation-many' && field.relation?.joinTable) {
        // Many-to-many: extract IDs from relation field
        const relatedModelName =
          field.relation.model.charAt(0).toLowerCase() + field.relation.model.slice(1)

        const joinRecords = (data[field.name] as Record<string, unknown>[]) || []
        transformed[field.name] = joinRecords
          .map((jr) => (jr[relatedModelName] as Record<string, unknown>)?.id)
          .filter(Boolean)
      }
    }

    return transformed
  }

  /**
   * Get options for relation dropdowns
   * PUBLIC method - used by API routes
   */
  public async getRelatedOptions(
    relationConfig: RelationConfig
  ): Promise<Array<{ id: number | string; label: string }>> {
    const modelName =
      relationConfig.model.charAt(0).toLowerCase() + relationConfig.model.slice(1)
    const delegate = (prisma as any)[modelName]

    const records = await delegate.findMany({
      select: {
        id: true,
        [relationConfig.displayField]: true,
      },
      orderBy: {
        [relationConfig.displayField]: 'asc',
      },
    })

    return records.map((r: Record<string, unknown>) => ({
      id: r.id as (number | string),
      label: String(r[relationConfig.displayField]),
    }))
  }

  /**
   * List records with pagination, search, and sorting
   */
  async list(params: ListParams = {}): Promise<ListResult<T>> {
    const {
      page = 1,
      perPage = this.config.perPage || 10,
      search = '',
      sortBy = this.config.defaultSort?.field || 'id',
      sortDirection = this.config.defaultSort?.direction || 'desc',
    } = params

    const delegate = this.getDelegate()
    const skip = (page - 1) * perPage
    const include = this.buildInclude()

    // Build search filter
    const where: Record<string, unknown> = {}
    if (search && this.config.searchFields && this.config.searchFields.length > 0) {
      where.OR = this.config.searchFields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }))
    }

    // Execute queries
    const [data, total] = await Promise.all([
      delegate.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { [sortBy]: sortDirection },
        include: Object.keys(include).length > 0 ? include : undefined,
      }),
      delegate.count({ where }),
    ])

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  /**
   * Get single record by ID
   */
  async findById(id: number | string): Promise<T | null> {
    const delegate = this.getDelegate()
    const include = this.buildInclude()

    return delegate.findUnique({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
      include: Object.keys(include).length > 0 ? include : undefined,
    })
  }

  /**
   * Create new record
   */
  async create(data: Partial<T>): Promise<T> {
    const delegate = this.getDelegate()
    const prismaData = this.transformFormDataToPrisma(data, 'create')
    const include = this.buildInclude()

    return delegate.create({
      data: prismaData,
      include: Object.keys(include).length > 0 ? include : undefined,
    })
  }

  /**
   * Update existing record
   */
  async update(id: number | string, data: Partial<T>): Promise<T> {
    const delegate = this.getDelegate()
    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id

    // Delete old many-to-many relations
    for (const field of this.getRelationFields()) {
      if (field.type === 'relation-many' && field.relation?.joinTable) {
        const joinTableName =
          field.relation.joinTable.charAt(0).toLowerCase() +
          field.relation.joinTable.slice(1)
        const localKey = field.relation.localKey || this.modelName + 'Id'

        await (prisma as any)[joinTableName].deleteMany({
          where: { [localKey]: parsedId },
        })
      }
    }

    const prismaData = this.transformFormDataToPrisma(data, 'update')
    const include = this.buildInclude()

    return delegate.update({
      where: { id: parsedId },
      data: prismaData,
      include: Object.keys(include).length > 0 ? include : undefined,
    })
  }

  /**
   * Delete record
   */
  async delete(id: number | string): Promise<T> {
    const delegate = this.getDelegate()
    return delegate.delete({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
    })
  }
}

/**
 * Get repository instance for a model
 */
export function getRepository<T = any>(config: ModelConfig): GenericRepository<T> {
  return new GenericRepository<T>(config)
}
