import { NextResponse, NextRequest } from 'next/server';
import { getDeviceById, deleteDevice } from '../../../../lib/db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

// GET /api/devices/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const device = await getDeviceById(id);

    if (!device) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: device },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch device details' },
      { status: 500 }
    );
  }
}

// DELETE /api/devices/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const device = await getDeviceById(id);
    const success = await deleteDevice(id, device?.brand);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Device not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Device deleted successfully!' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete device' },
      { status: 500 }
    );
  }
}
