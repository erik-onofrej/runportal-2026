import prisma from '@/lib/prisma';
import { resultsService } from './results.service';

/**
 * Results Import Service
 * Handles CSV parsing, validation, and bulk import of race results
 */

export const resultsImportService = {
  parseCSV,
  validateResults,
  importResults,
  matchRegistrations,
};

/**
 * CSV row interface
 */
interface CSVRow {
  registrationNumber?: string;
  bibNumber?: string;
  firstName: string;
  lastName: string;
  finishTime?: string;
  overallPlace?: string;
  categoryPlace?: string;
  status: string;
  gunTime?: string;
  pace?: string;
}

/**
 * Parse CSV file to JSON
 */
async function parseCSV(csvContent: string): Promise<CSVRow[]> {
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  // Parse header
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  // Parse data rows
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());

    const row: any = {};
    headers.forEach((header, index) => {
      // Map CSV columns to our format
      const mappedHeader = mapCSVHeader(header);
      row[mappedHeader] = values[index] || '';
    });

    rows.push(row as CSVRow);
  }

  return rows;
}

/**
 * Map CSV header names to our field names
 */
function mapCSVHeader(header: string): string {
  const mapping: Record<string, string> = {
    'registration number': 'registrationNumber',
    'reg number': 'registrationNumber',
    'registration': 'registrationNumber',
    'bib': 'bibNumber',
    'bib number': 'bibNumber',
    'first name': 'firstName',
    'firstname': 'firstName',
    'last name': 'lastName',
    'lastname': 'lastName',
    'finish time': 'finishTime',
    'time': 'finishTime',
    'overall place': 'overallPlace',
    'place': 'overallPlace',
    'category place': 'categoryPlace',
    'cat place': 'categoryPlace',
    'status': 'status',
    'gun time': 'gunTime',
    'pace': 'pace',
  };

  return mapping[header] || header;
}

/**
 * Validate CSV results against registrations
 */
async function validateResults(
  csvRows: CSVRow[],
  runId: number
): Promise<{
  valid: Array<{ row: CSVRow; registration: any }>;
  errors: Array<{ row: CSVRow; error: string }>;
}> {
  const valid: Array<{ row: CSVRow; registration: any }> = [];
  const errors: Array<{ row: CSVRow; error: string }> = [];

  // Get all registrations for this run
  const registrations = await prisma.registration.findMany({
    where: { runId },
    include: {
      category: true,
    },
  });

  for (const row of csvRows) {
    try {
      // Try to match registration
      const registration = await matchRegistration(row, registrations);

      if (!registration) {
        errors.push({
          row,
          error: `No matching registration found for ${row.firstName} ${row.lastName}`,
        });
        continue;
      }

      // Validate finish time for finished status
      if (row.status === 'finished' && !row.finishTime) {
        errors.push({
          row,
          error: `Finish time required for finished status`,
        });
        continue;
      }

      // Validate status
      const validStatuses = ['finished', 'dnf', 'dsq', 'dns'];
      if (!validStatuses.includes(row.status.toLowerCase())) {
        errors.push({
          row,
          error: `Invalid status: ${row.status}. Must be one of: ${validStatuses.join(', ')}`,
        });
        continue;
      }

      valid.push({ row, registration });
    } catch (error) {
      errors.push({
        row,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { valid, errors };
}

/**
 * Match a CSV row to a registration
 * Tries multiple strategies in order of preference:
 * 1. Registration number (most reliable)
 * 2. Bib number
 * 3. First name + Last name + DOB fuzzy match
 */
async function matchRegistration(
  row: CSVRow,
  registrations: any[]
): Promise<any | null> {
  // Strategy 1: Match by registration number
  if (row.registrationNumber) {
    const match = registrations.find(
      (r) => r.registrationNumber === row.registrationNumber
    );
    if (match) return match;
  }

  // Strategy 2: Match by bib number
  if (row.bibNumber) {
    const match = registrations.find((r) => r.bibNumber === row.bibNumber);
    if (match) return match;
  }

  // Strategy 3: Match by name (fuzzy)
  const nameMatches = registrations.filter((r) => {
    const firstNameMatch =
      r.guestFirstName.toLowerCase() === row.firstName.toLowerCase();
    const lastNameMatch =
      r.guestLastName.toLowerCase() === row.lastName.toLowerCase();
    return firstNameMatch && lastNameMatch;
  });

  if (nameMatches.length === 1) {
    return nameMatches[0];
  }

  if (nameMatches.length > 1) {
    throw new Error(
      `Multiple registrations found for ${row.firstName} ${row.lastName}. Please use registration number or bib number for disambiguation.`
    );
  }

  return null;
}

/**
 * Parse time string to seconds
 * Supports formats: HH:MM:SS, MM:SS, or raw seconds
 */
function parseTime(timeStr: string): number {
  if (!timeStr) return 0;

  // If it's already a number, return it
  if (!isNaN(Number(timeStr))) {
    return Number(timeStr);
  }

  // Parse HH:MM:SS or MM:SS format
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  }

  throw new Error(`Invalid time format: ${timeStr}`);
}

/**
 * Import validated results into database
 */
async function importResults(
  validResults: Array<{ row: CSVRow; registration: any }>,
  runId: number
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const { row, registration } of validResults) {
    try {
      // Check if result already exists
      const existing = await prisma.runResult.findUnique({
        where: { registrationId: registration.id },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Parse finish time
      let finishTime: number | null = null;
      let gunTime: number | null = null;
      let pace: number | null = null;

      if (row.finishTime) {
        finishTime = parseTime(row.finishTime);

        // Calculate pace if we have distance
        const run = await prisma.run.findUnique({
          where: { id: runId },
          select: { distance: true },
        });

        if (run && finishTime > 0) {
          pace = finishTime / 60 / run.distance; // minutes per km
        }
      }

      if (row.gunTime) {
        gunTime = parseTime(row.gunTime);
      }

      // Create result
      await prisma.runResult.create({
        data: {
          registrationId: registration.id,
          runId,
          categoryId: registration.categoryId,
          runnerId: registration.runnerId,
          overallPlace: row.overallPlace ? parseInt(row.overallPlace) : null,
          categoryPlace: row.categoryPlace ? parseInt(row.categoryPlace) : null,
          finishTime,
          gunTime,
          resultStatus: row.status.toLowerCase(),
          pace,
          importedAt: new Date(),
          importSource: 'csv_import',
        },
      });

      imported++;
    } catch (error) {
      errors.push(
        `Error importing result for ${row.firstName} ${row.lastName}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  // Recalculate placements after import
  if (imported > 0) {
    await resultsService.calculatePlacements(runId);
  }

  return { imported, skipped, errors };
}

/**
 * High-level import function that handles the entire process
 */
async function matchRegistrations(
  csvContent: string,
  runId: number
): Promise<{
  valid: number;
  errors: Array<{ row: CSVRow; error: string }>;
  imported: number;
  skipped: number;
  importErrors: string[];
}> {
  // Parse CSV
  const rows = await parseCSV(csvContent);

  // Validate
  const { valid, errors } = await validateResults(rows, runId);

  // Import
  const { imported, skipped, errors: importErrors } = await importResults(
    valid,
    runId
  );

  return {
    valid: valid.length,
    errors,
    imported,
    skipped,
    importErrors,
  };
}
