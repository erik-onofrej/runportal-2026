import { ModelConfig, AdminConfig } from './types'
import { userConfig } from '@/models/user.config'
import { blogConfig } from '@/models/blog.config'
import { categoryConfig } from '@/models/category.config'
import { contactSubmissionConfig } from '@/models/contactSubmission.config'
// Running Events Models
import { regionConfig } from '@/models/region.config'
import { districtConfig } from '@/models/district.config'
import { locationConfig } from '@/models/location.config'
import { organizerConfig } from '@/models/organizer.config'
import { eventConfig } from '@/models/event.config'
import { runConfig } from '@/models/run.config'
import { runCategoryConfig } from '@/models/runCategory.config'
import { runEntryFeeConfig } from '@/models/runEntryFee.config'
import { eventScheduleConfig } from '@/models/eventSchedule.config'
import { partnerConfig } from '@/models/partner.config'
import { eventAttachmentConfig } from '@/models/eventAttachment.config'
import { runnerConfig } from '@/models/runner.config'
import { registrationConfig } from '@/models/registration.config'
import { runResultConfig } from '@/models/runResult.config'

// Central registry of all admin models
export const adminConfig: AdminConfig = {
  title: 'Admin Panel',
  basePath: '/admin-v2',
  models: [
    userConfig,
    blogConfig,
    categoryConfig,
    contactSubmissionConfig,
    // Running Events
    regionConfig,
    districtConfig,
    locationConfig,
    organizerConfig,
    eventConfig,
    runConfig,
    runCategoryConfig,
    runEntryFeeConfig,
    eventScheduleConfig,
    partnerConfig,
    eventAttachmentConfig,
    runnerConfig,
    registrationConfig,
    runResultConfig,
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
