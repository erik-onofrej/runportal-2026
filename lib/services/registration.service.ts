import prisma from '@/lib/prisma';
import type { Registration, Runner } from '@prisma/client';

/**
 * Registration Service
 * Handles registration logic including guest registration,
 * registration number generation, entry fee calculation, etc.
 */

export const registrationService = {
  createGuestRegistration,
  generateRegistrationNumber,
  getActiveEntryFee,
  updatePaymentStatus,
  markPresented,
  getOrCreateRunner,
  getRegistrationByNumber,
  getRegistrationsByRun,
};

/**
 * Create a guest registration
 * This is the main registration flow for public users
 */
async function createGuestRegistration(data: {
  runId: number;
  categoryId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  gender: string;
  city?: string;
  club?: string;
}): Promise<Registration> {
  // Check if runner exists by email
  const existingRunner = await prisma.runner.findUnique({
    where: { email: data.email },
  });

  // Generate registration number
  const registrationNumber = await generateRegistrationNumber(data.runId);

  // Get active entry fee
  const entryFee = await getActiveEntryFee(data.runId, new Date());

  // Create registration
  const registration = await prisma.registration.create({
    data: {
      runId: data.runId,
      categoryId: data.categoryId,
      runnerId: existingRunner?.id,
      guestFirstName: data.firstName,
      guestLastName: data.lastName,
      guestEmail: data.email,
      guestPhone: data.phone,
      guestDateOfBirth: data.dateOfBirth,
      guestGender: data.gender,
      guestCity: data.city,
      guestClub: data.club,
      registrationNumber,
      paidAmount: entryFee?.amount,
      status: 'pending',
    },
    include: {
      run: {
        include: {
          event: true,
        },
      },
      category: true,
      runner: true,
    },
  });

  return registration;
}

/**
 * Generate unique registration number
 * Format: {EventCode}{Year}-{Sequential}
 * Example: BRM2025-000001
 */
async function generateRegistrationNumber(runId: number): Promise<string> {
  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: { event: true },
  });

  if (!run) {
    throw new Error('Run not found');
  }

  const year = new Date().getFullYear();

  // Generate event code from first 3 characters of event title
  const eventCode = run.event.title
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase();

  // Count existing registrations for this event
  const count = await prisma.registration.count({
    where: {
      run: {
        eventId: run.eventId,
      },
    },
  });

  const sequential = String(count + 1).padStart(6, '0');
  return `${eventCode}${year}-${sequential}`;
}

/**
 * Get active entry fee for a run at a specific date
 */
async function getActiveEntryFee(
  runId: number,
  date: Date = new Date()
): Promise<{ id: number; name: string; amount: number; currency: string } | null> {
  const entryFee = await prisma.runEntryFee.findFirst({
    where: {
      runId,
      validFrom: { lte: date },
      validTo: { gte: date },
    },
    orderBy: {
      sortOrder: 'asc',
    },
    select: {
      id: true,
      name: true,
      amount: true,
      currency: true,
    },
  });

  return entryFee;
}

/**
 * Update payment status for a registration
 */
async function updatePaymentStatus(
  registrationId: number,
  paid: boolean,
  amount?: number,
  paidAt?: Date
): Promise<Registration> {
  return prisma.registration.update({
    where: { id: registrationId },
    data: {
      paid,
      paidAmount: amount,
      paidAt: paidAt || (paid ? new Date() : null),
      status: paid ? 'confirmed' : 'pending',
    },
  });
}

/**
 * Mark a registration as presented (showed up on event day)
 */
async function markPresented(
  registrationId: number,
  bibNumber?: string
): Promise<Registration> {
  return prisma.registration.update({
    where: { id: registrationId },
    data: {
      presented: true,
      bibNumber,
    },
  });
}

/**
 * Get or create a runner profile
 * Used to link registrations to persistent runner accounts
 */
async function getOrCreateRunner(data: {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  phone?: string;
  city?: string;
  club?: string;
  userId?: string;
}): Promise<Runner> {
  // Try to find existing runner
  const existing = await prisma.runner.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    return existing;
  }

  // Create new runner
  return prisma.runner.create({
    data: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      phone: data.phone,
      city: data.city,
      club: data.club,
      userId: data.userId,
    },
  });
}

/**
 * Get registration by registration number
 */
async function getRegistrationByNumber(
  registrationNumber: string
): Promise<Registration | null> {
  return prisma.registration.findUnique({
    where: { registrationNumber },
    include: {
      run: {
        include: {
          event: {
            include: {
              location: true,
              organizer: true,
            },
          },
        },
      },
      category: true,
      runner: true,
    },
  });
}

/**
 * Get all registrations for a run
 */
async function getRegistrationsByRun(
  runId: number,
  filters?: {
    status?: string;
    paid?: boolean;
    presented?: boolean;
  }
): Promise<Registration[]> {
  return prisma.registration.findMany({
    where: {
      runId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.paid !== undefined && { paid: filters.paid }),
      ...(filters?.presented !== undefined && { presented: filters.presented }),
    },
    include: {
      category: true,
      runner: true,
    },
    orderBy: {
      registeredAt: 'desc',
    },
  });
}
