import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used to store the PHI field names that an endpoint accesses.
 */
export const ACCESSES_PHI_KEY = 'accesses_phi_fields';

/**
 * Decorator that marks a controller method as accessing Protected Health Information (PHI).
 *
 * When applied, the `PHIAccessGuard` will:
 *  1. Verify the user has the `members:view-phi` permission
 *  2. Log the PHI access to the HIPAA audit trail
 *
 * @param fields  The PHI field names accessed by this endpoint
 *
 * @example
 * ```ts
 * @Get(':id')
 * @AccessesPHI(['ssn', 'dateOfBirth', 'medicalHistory'])
 * getMemberDetails(@Param('id') id: string) { ... }
 * ```
 */
export const AccessesPHI = (...fields: string[]) =>
  SetMetadata(ACCESSES_PHI_KEY, fields);
