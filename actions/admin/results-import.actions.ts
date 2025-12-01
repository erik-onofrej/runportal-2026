'use server';

import { resultsImportService } from '@/lib/services/results-import.service';
import { resultsService } from '@/lib/services/results.service';

/**
 * Admin actions for importing and managing results
 */

/**
 * Parse and validate CSV file for results import
 */
export async function parseAndValidateCSV(csvContent: string, runId: number) {
  try {
    // Parse CSV
    const rows = await resultsImportService.parseCSV(csvContent);

    // Validate against registrations
    const { valid, errors } = await resultsImportService.validateResults(
      rows,
      runId
    );

    return {
      success: true,
      data: {
        totalRows: rows.length,
        validRows: valid.length,
        errorRows: errors.length,
        valid,
        errors,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse CSV',
    };
  }
}

/**
 * Import results from CSV content
 */
export async function importResultsFromCSV(csvContent: string, runId: number) {
  try {
    const result = await resultsImportService.matchRegistrations(
      csvContent,
      runId
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import results',
    };
  }
}

/**
 * Recalculate placements for a run
 */
export async function recalculatePlacements(runId: number) {
  try {
    await resultsService.calculatePlacements(runId);

    return {
      success: true,
      message: 'Placements recalculated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to recalculate placements',
    };
  }
}

/**
 * Export results to CSV
 */
export async function exportResultsToCSV(runId: number) {
  try {
    const csv = await resultsService.exportResults(runId);

    return {
      success: true,
      data: csv,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export results',
    };
  }
}

/**
 * Get results preview for a run
 */
export async function getResultsPreview(runId: number) {
  try {
    const results = await resultsService.getResultsWithDetails(runId);

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch results',
    };
  }
}
