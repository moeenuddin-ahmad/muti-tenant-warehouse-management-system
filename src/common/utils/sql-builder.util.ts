/**
 * Reusable utility to build dynamic fields and values for SQL UPDATE queries.
 *
 * @param dto The data object containing fields to update.
 * @param startIdx The starting parameter index (default: 1).
 * @returns An object containing fields string, values array, and the next parameter index.
 */
export function buildUpdateFields(dto: Record<string, any>, startIdx = 1) {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = startIdx;

  for (const [key, value] of Object.entries(dto)) {
    // Skip undefined or null values to allow partial updates
    if (value !== undefined && value !== null) {
      // Convert camelCase to snake_case for standard PostgreSQL naming
      const column = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);

      fields.push(`${column} = $${idx++}`);
      values.push(value);
    }
  }

  return {
    fieldsString: fields.join(', '),
    values,
    nextIdx: idx,
  };
}
