/**
 * Central mapping of model names to their getOptions server actions
 * Used by relation-select and relation-multi-select components
 */

import { getUserOptions } from '@/actions/v2/user.actions'
import { getBlogOptions } from '@/actions/v2/blog.actions'
import { getCategoryOptions } from '@/actions/v2/category.actions'
import { getContactSubmissionOptions } from '@/actions/v2/contactSubmission.actions'
import { getRegionOptions } from '@/actions/v2/region.actions'
import { getDistrictOptions } from '@/actions/v2/district.actions'
import { getLocationOptions } from '@/actions/v2/location.actions'
import { getOrganizerOptions } from '@/actions/v2/organizer.actions'
import { getEventOptions } from '@/actions/v2/event.actions'
import { getRunOptions } from '@/actions/v2/run.actions'
import { getRunCategoryOptions } from '@/actions/v2/runCategory.actions'
import { getRunEntryFeeOptions } from '@/actions/v2/runEntryFee.actions'
import { getEventScheduleOptions } from '@/actions/v2/eventSchedule.actions'
import { getPartnerOptions } from '@/actions/v2/partner.actions'
import { getEventAttachmentOptions } from '@/actions/v2/eventAttachment.actions'
import { getRegistrationOptions } from '@/actions/v2/registration.actions'
import { getRunResultOptions } from '@/actions/v2/runResult.actions'
import type { ActionResponse } from '../types/action.types'

export const optionsActionsMap: Record<string, () => Promise<ActionResponse>> = {
  user: getUserOptions,
  blog: getBlogOptions,
  category: getCategoryOptions,
  contactsubmission: getContactSubmissionOptions,
  region: getRegionOptions,
  district: getDistrictOptions,
  location: getLocationOptions,
  organizer: getOrganizerOptions,
  event: getEventOptions,
  run: getRunOptions,
  runcategory: getRunCategoryOptions,
  runentryfee: getRunEntryFeeOptions,
  eventschedule: getEventScheduleOptions,
  partner: getPartnerOptions,
  eventattachment: getEventAttachmentOptions,
  registration: getRegistrationOptions,
  runresult: getRunResultOptions,
}

export async function getRelationOptions(modelName: string) {
  const getOptions = optionsActionsMap[modelName.toLowerCase()]

  if (!getOptions) {
    throw new Error(`No options action found for model: ${modelName}`)
  }

  return getOptions()
}
