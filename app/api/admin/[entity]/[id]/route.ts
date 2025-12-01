import { NextRequest, NextResponse } from 'next/server'
import { getModelConfig } from '@/lib/admin/config'
import { getRepository } from '@/lib/admin/repository'
import { validateModelData } from '@/lib/admin/schema-generator'

/**
 * GET /api/admin/[entity]/[id]
 * Get single record (transformed for edit forms)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  try {
    const { entity, id } = await params
    const config = getModelConfig(entity)
    if (!config) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const repository = getRepository(config)
    const record = await repository.findById(id)

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    // Transform Prisma data to form data (extract IDs from relations)
    const formData = repository.transformPrismaToFormData(record)
    return NextResponse.json(formData)
  } catch (error) {
    console.error('Error fetching record:', error)
    return NextResponse.json({ error: 'Failed to fetch record' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/[entity]/[id]
 * Update record
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  try {
    const { entity, id } = await params
    const config = getModelConfig(entity)
    if (!config) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const body = await request.json()

    // Validate
    const validation = validateModelData(config, body, 'update')
    if (!validation.success) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 })
    }

    // Update
    const repository = getRepository(config)
    const record = await repository.update(id, validation.data)

    // Call afterUpdate hook if exists
    if (config.afterUpdate) {
      await config.afterUpdate(record)
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error updating record:', error)
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/[entity]/[id]
 * Delete record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  try {
    const { entity, id } = await params
    const config = getModelConfig(entity)
    if (!config) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const repository = getRepository(config)
    await repository.delete(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting record:', error)
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 })
  }
}
