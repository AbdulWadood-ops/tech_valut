/**
 * Part 1.4 — Supercluster Spatial Indexing
 * 
 * Groups 10k–20k geographic device pins into clusters at zoom-out levels
 * and expands them smoothly at zoom-in levels.
 */

import Supercluster from 'supercluster';

export interface GeoDevice {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status?: string;
  [key: string]: any;
}

export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export class DeviceSpatialClusterIndex {
  private index: Supercluster;

  constructor(devices: GeoDevice[], radius = 60, maxZoom = 16) {
    this.index = new Supercluster({
      radius,
      maxZoom,
      minPoints: 2,
    });

    const points = devices.map((d) => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        deviceId: d.id,
        name: d.name,
        status: d.status,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [d.lng, d.lat] as [number, number],
      },
    }));

    this.index.load(points);
  }

  /**
   * Get clustered features for the given viewport bounding box and zoom level.
   */
  public getClusters(bbox: BoundingBox, zoom: number) {
    return this.index.getClusters(
      [bbox.west, bbox.south, bbox.east, bbox.north],
      Math.floor(zoom)
    );
  }

  /**
   * Get children / leaves of a specific cluster ID.
   */
  public getLeaves(clusterId: number, limit = 10, offset = 0) {
    return this.index.getLeaves(clusterId, limit, offset);
  }
}
