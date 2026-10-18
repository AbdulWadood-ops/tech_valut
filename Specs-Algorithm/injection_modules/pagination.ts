/**
 * Part 1.2 — Cursor-based Pagination Helper
 * 
 * Never send all 10k-20k devices at once.
 * Cursor pagination gives O(1) seek performance in MongoDB compared to slow .skip(offset).
 */

export interface CursorPaginationOptions {
  cursor?: string;
  limit?: number;
  filter?: Record<string, any>;
  sortField?: string;
}

export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Execute cursor-based query on Mongoose or native MongoDB collection.
 */
export async function paginateByCursor<T extends { _id: any; id?: string }>(
  ModelOrCollection: any,
  options: CursorPaginationOptions = {}
): Promise<CursorPaginationResult<T>> {
  const limit = Math.min(100, Math.max(1, options.limit || 50));
  const query = { ...(options.filter || {}) };

  if (options.cursor) {
    query._id = { $gt: options.cursor };
  }

  // Fetch limit + 1 items to check if there is a next page
  const items: T[] = await ModelOrCollection.find(query)
    .sort({ _id: 1 })
    .limit(limit + 1)
    .lean();

  const hasMore = items.length > limit;
  if (hasMore) {
    items.pop(); // Remove the extra check item
  }

  const nextCursor = items.length > 0 ? String(items[items.length - 1]._id) : null;

  return {
    items,
    nextCursor: hasMore ? nextCursor : null,
    hasMore,
  };
}
