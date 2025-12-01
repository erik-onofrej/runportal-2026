import { ModelConfig, AdminConfig } from './types'
import { userConfig } from '@/models/user.config'
import { blogConfig } from '@/models/blog.config'
import { categoryConfig } from '@/models/category.config'
import { galleryConfig } from '@/models/gallery.config'
import { galleryImageConfig } from '@/models/galleryImage.config'
import { contactSubmissionConfig } from '@/models/contactSubmission.config'

// Central registry of all admin models
export const adminConfig: AdminConfig = {
  title: 'Admin Panel',
  basePath: '/admin',
  models: [
    userConfig,
    blogConfig,
    categoryConfig,
    galleryConfig,
    galleryImageConfig,
    contactSubmissionConfig,
  ],
}

// Helper to get model config by name
export function getModelConfig(modelName: string): ModelConfig | undefined {
  return adminConfig.models.find(
    (m) => m.name.toLowerCase() === modelName.toLowerCase()
  )
}

// Helper to get all model configs
export function getAllModelConfigs(): ModelConfig[] {
  return adminConfig.models
}
