const fs = require('fs')
const path = require('path')
const models = require('../models-config')

// Utility functions
function toCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

function toPlural(str) {
  // Simple pluralization
  if (str.endsWith('y')) {
    return str.slice(0, -1) + 'ies'
  }
  if (str.endsWith('s')) {
    return str + 'es'
  }
  return str + 's'
}

function generateIncludeBlock(relations) {
  if (!relations || relations.length === 0) return ''

  const includes = relations.map((rel) => {
    if (rel.type === 'many-to-one') {
      return `      ${rel.name}: true,`
    } else if (rel.type === 'many-to-many') {
      return `      ${rel.name}: {
        include: {
          ${rel.model}: true,
        },
      },`
    }
    return ''
  }).filter(Boolean)

  if (includes.length === 0) return ''

  return `      include: {
${includes.join('\n')}
      },`
}

function generateSearchFieldsOr(searchFields) {
  return searchFields
    .map(
      (field) =>
        `      { ${field}: { contains: search.query, mode: 'insensitive' } },`
    )
    .join('\n')
}

function generateManyToManyExtract(relations) {
  const manyToMany = relations.filter((r) => r.type === 'many-to-many')
  if (manyToMany.length === 0) return ''

  const fieldNames = manyToMany.map((r) => r.name).join(', ')
  return `  const { ${fieldNames}, ...restData } = data`
}

function generateManyToManyCreate(relations, models) {
  const manyToMany = relations.filter((r) => r.type === 'many-to-many')
  if (manyToMany.length === 0) return ''

  return manyToMany
    .map(
      (rel) => {
        // Find the related model to get its ID type
        const relatedModel = models.find(m => m.modelName === rel.model)
        const idType = relatedModel ? relatedModel.idType : 'number'

        return `      ${rel.name}: Array.isArray(${rel.name})
        ? {
            create: (${rel.name} as ${idType}[]).map((${rel.model}Id: ${idType}) => ({
              ${rel.foreignKey}: ${rel.model}Id,
            })),
          }
        : undefined,`
      }
    )
    .join('\n')
}

function generateManyToManyDeleteOld(model, relations) {
  const manyToMany = relations.filter((r) => r.type === 'many-to-many')
  if (manyToMany.length === 0) return ''

  return manyToMany
    .map(
      (rel) => `  if (${rel.name} !== undefined) {
    await prisma.${rel.joinTable}.deleteMany({
      where: { ${model}Id: id },
    })
  }`
    )
    .join('\n\n')
}

function getDataVar(relations) {
  const manyToMany = relations.filter((r) => r.type === 'many-to-many')
  return manyToMany.length > 0 ? 'restData' : 'data'
}

function generateService(model) {
  const templatePath = path.join(__dirname, 'templates/service.template.ts')
  const template = fs.readFileSync(templatePath, 'utf8')

  const dataVar = getDataVar(model.relations)

  let output = template
    .replace(/\[ENTITY\]/g, model.name)
    .replace(/\[MODEL\]/g, model.modelName)
    .replace(/\[MODEL_CAMEL\]/g, toCamelCase(model.modelName))
    .replace(/\[ID_TYPE\]/g, model.idType)
    .replace(/\[OPTION_FIELD\]/g, model.optionField)
    .replace(/\[DATA_VAR\]/g, dataVar)
    .replace(
      /\[DEFAULT_ORDER_BY\]/g,
      JSON.stringify(model.defaultOrderBy).replace(/"/g, "'")
    )
    .replace(/\[SEARCH_FIELDS_OR\]/g, generateSearchFieldsOr(model.searchFields))

  // Handle include block
  const includeBlock = generateIncludeBlock(model.relations)
  output = output.replace(/\[INCLUDE_BLOCK\]\n/g, includeBlock ? includeBlock + '\n' : '')

  // Handle many-to-many extract
  const manyToManyExtract = generateManyToManyExtract(model.relations)
  output = output.replace(
    /\[MANY_TO_MANY_EXTRACT\]\n/g,
    manyToManyExtract ? manyToManyExtract + '\n' : ''
  )

  // Handle many-to-many create
  const manyToManyCreate = generateManyToManyCreate(model.relations, models)
  output = output.replace(
    /\[MANY_TO_MANY_CREATE\]\n/g,
    manyToManyCreate ? manyToManyCreate + '\n' : ''
  )

  // Handle many-to-many delete old
  const manyToManyDeleteOld = generateManyToManyDeleteOld(
    model.modelName,
    model.relations
  )
  output = output.replace(
    /\[MANY_TO_MANY_DELETE_OLD\]\n/g,
    manyToManyDeleteOld ? manyToManyDeleteOld + '\n\n' : ''
  )

  const outputPath = path.join(
    __dirname,
    `../../lib/admin-v2/services/${model.modelName}.service.ts`
  )

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, output)
  console.log(`✓ Generated service: ${model.modelName}.service.ts`)
}

function generateActions(model) {
  const templatePath = path.join(__dirname, 'templates/actions.template.ts')
  const template = fs.readFileSync(templatePath, 'utf8')

  let output = template
    .replace(/\[ENTITY\]/g, model.name)
    .replace(/\[ENTITY_PLURAL\]/g, toPlural(model.name))
    .replace(/\[MODEL\]/g, model.modelName)
    .replace(/\[MODEL_CAMEL\]/g, toCamelCase(model.modelName))
    .replace(/\[ID_TYPE\]/g, model.idType)

  const outputPath = path.join(
    __dirname,
    `../../actions/v2/${model.modelName}.actions.ts`
  )

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, output)
  console.log(`✓ Generated actions: ${model.modelName}.actions.ts`)
}

// Main execution
console.log('🚀 Generating Admin V2 services and actions...\n')

models.forEach((model) => {
  console.log(`Generating ${model.name}...`)
  generateService(model)
  generateActions(model)
  console.log('')
})

console.log('✅ Generation complete!')
console.log('\nGenerated files:')
console.log('  Services:')
models.forEach((model) => {
  console.log(`    - lib/admin-v2/services/${model.modelName}.service.ts`)
})
console.log('  Actions:')
models.forEach((model) => {
  console.log(`    - actions/v2/${model.modelName}.actions.ts`)
})
