/**
 * Part 1.5 — Real-Time Delta Patch Updates (Client & Server Helpers)
 * 
 * Instead of refetching the entire 10k–20k list on every status change,
 * only stream the modified fields (delta) and patch the client-side state in-place.
 */

export interface DeviceDeltaUpdate {
  id: string;
  status?: string;
  searchCount?: number;
  requestCount?: number;
  lastAccessedHoursAgo?: number;
  [key: string]: any;
}

/**
 * Client-side hook helper: apply a single incoming delta update to an existing device array
 * with O(1) or O(N) in-place immutability.
 */
export function applyDeviceDelta<T extends { id: string }>(
  devices: T[],
  delta: DeviceDeltaUpdate
): T[] {
  const index = devices.findIndex((d) => d.id === delta.id);
  if (index === -1) return devices;

  const next = [...devices];
  next[index] = {
    ...next[index],
    ...delta,
  };
  return next;
}
