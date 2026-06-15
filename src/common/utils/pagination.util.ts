export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function paginateResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total: Number(total),
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Flexible Raw SQL Pagination Utility
 */
export async function paginate(
  databaseService: any,
  tableName: string,
  query: any,
  searchFields: string[] = [],
  extraFilters: Record<string, any> = {}, // Any extra filters like { tenant_id: 1, fileSpaceId: 5 }
) {
  const {
    page = 1,
    limit = 10,
    search,
    sortOrder = 'DESC',
    sortBy = 'created_at',
  } = query;

  const pageSize = Number(limit);
  const offset = (Number(page) - 1) * pageSize;

  const whereClauses: string[] = [];
  const params: any[] = [];

  // 1. Handle Extra Dynamic Filters (tenant_id, fileSpaceId, etc.)
  for (const [key, value] of Object.entries(extraFilters)) {
    if (value !== undefined && value !== null) {
      whereClauses.push(`${key} = $${params.length + 1}`);
      params.push(value);
    }
  }

  // 2. Handle Searching
  if (search && searchFields.length > 0) {
    const searchCondition = searchFields
      .map((field) => `${field} ILIKE $${params.length + 1}`)
      .join(' OR ');
    whereClauses.push(`(${searchCondition})`);
    params.push(`%${search}%`);
  }

  const whereString =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // SQL Queries
  const countSql = `SELECT COUNT(*) FROM ${tableName} ${whereString}`;
  const dataSql = `
    SELECT * FROM ${tableName} 
    ${whereString} 
    ORDER BY ${sortBy} ${sortOrder} 
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  const [countRes, dataRes] = await Promise.all([
    databaseService.query(countSql, params),
    databaseService.query(dataSql, params),
  ]);

  const total = parseInt(countRes.rows[0].count);

  return paginateResponse(dataRes.rows, total, Number(page), pageSize);
}
