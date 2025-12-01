import { NextRequest, NextResponse } from 'next/server'
import { getModelConfig } from '@/lib/admin/config'
import { getRepository } from '@/lib/admin/repository'
import { validateModelData } from '@/lib/admin/schema-generator'

/**
 * GET /api/admin/[entity]
 * List records with pagination, search, sorting
 * OR get relation options if ?relation=fieldName is provided
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params
    const config = getModelConfig(entity)
    if (!config) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const relationField = searchParams.get('relation')
    const displayField = searchParams.get('displayField')

    // Handle relation options request
    if (relationField && displayField) {
      // When fetching options, we want all records from this model
      // formatted as {id, label} using the specified displayField
      const repository = getRepository(config)
      const options = await repository.getRelatedOptions({
        model: config.name,
        displayField: displayField,
      })
      return NextResponse.json(options)
    }

    // Handle regular list request
    const repository = getRepository(config)
    const result = await repository.list({
      page: parseInt(searchParams.get('page') || '1'),
      perPage: parseInt(searchParams.get('perPage') || String(config.perPage || 10)),
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || config.defaultSort?.field || 'id',
      sortDirection: (searchParams.get('sortDirection') as 'asc' | 'desc') || config.defaultSort?.direction || 'desc',
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error listing records:', error)
    return NextResponse.json({ error: 'Failed to list records' }, { status: 500 })
  }
}

/**
 * POST /api/admin/[entity]
 * Create new record
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params
    const config = getModelConfig(entity)
    if (!config) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const body = await request.json()

    // Validate
    const validation = validateModelData(config, body, 'create')
    if (!validation.success) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 })
    }

    // Create
    const repository = getRepository(config)
    const record = await repository.create(validation.data)

    // Call afterCreate hook if exists
    if (config.afterCreate) {
      await config.afterCreate(record)
    }

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating record:', error)
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 })
  }
}
