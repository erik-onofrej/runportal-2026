'use server';

import { registrationService } from '@/lib/services/registration.service';
import { z, ZodError } from 'zod';

/**
 * Registration Actions
 * Server actions for public race registration
 */

// Validation schema for registration
const registrationSchema = z.object({
  runId: z.number(),
  categoryId: z.number(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().refine((date) => {
    const dob = new Date(date);
    const age = (new Date().getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 5 && age <= 120;
  }, 'Invalid date of birth'),
  gender: z.enum(['male', 'female', 'other']),
  city: z.string().optional(),
  club: z.string().optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Create a new race registration
 */
export async function createRegistrationAction(
  data: RegistrationFormData
): Promise<{
  success: boolean;
  registrationNumber?: string;
  registrationId?: number;
  error?: string;
}> {
  try {
    // Validate input
    const validated = registrationSchema.parse(data);

    // Create registration
    const registration = await registrationService.createRegistration({
      ...validated,
      dateOfBirth: new Date(validated.dateOfBirth),
    });

    return {
      success: true,
      registrationNumber: registration.registrationNumber,
      registrationId: registration.id,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create registration',
    };
  }
}

/**
 * Get registration details by registration number
 */
export async function getRegistrationByNumberAction(
  registrationNumber: string
): Promise<{
  success: boolean;
  registration?: any;
  error?: string;
}> {
  try {
    const registration =
      await registrationService.getRegistrationByNumber(registrationNumber);

    if (!registration) {
      return {
        success: false,
        error: 'Registration not found',
      };
    }

    return {
      success: true,
      registration,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get registration',
    };
  }
}

/**
 * Get last registration by email for pre-filling form
 */
export async function getLastRegistrationByEmailAction(
  email: string
): Promise<{
  success: boolean;
  registration?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    dateOfBirth: Date;
    gender: string;
    city?: string | null;
    club?: string | null;
  };
  error?: string;
}> {
  try {
    const registration =
      await registrationService.getLastRegistrationByEmail(email);

    if (!registration) {
      return {
        success: false,
      };
    }

    return {
      success: true,
      registration,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get registration',
    };
  }
}
