import { NextResponse } from 'next/server';
import { getPaginatedDevices, addDevice, getDevices } from '../../../lib/db';
import type { Device } from '../../../data/devices';

export const dynamic = 'force-dynamic';

// GET /api/devices
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '45', 10);
    const brand = searchParams.get('brand') || searchParams.get('brands') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const all = searchParams.get('all') === 'true';

    if (all) {
      const list = await getDevices();
      return NextResponse.json(
        { success: true, data: list, total: list.length },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        }
      );
    }

    const result = await getPaginatedDevices({
      brand,
      page,
      limit,
      category,
      search,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.devices,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
        brandName: result.brandName,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

// POST /api/devices
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const device = body as Device;

    if (!device.name || !device.brand || !device.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required device information (name, brand, category).' },
        { status: 400 }
      );
    }

    const success = await addDevice(device);
    if (success) {
      return NextResponse.json({ success: true, message: 'Device added to database successfully!' });
    } else {
      return NextResponse.json(
        { success: false, error: 'Device ID already exists in the database.' },
        { status: 409 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add device' },
      { status: 500 }
    );
  }
}
