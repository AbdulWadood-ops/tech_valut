import { NextRequest, NextResponse } from 'next/server';
import { performHybridVerification } from '@/lib/verification';
import { getDeviceById, getDevicesDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let claimed = body.claimed;
    let reference = body.reference;
    let deviceId = body.deviceId || 'DEV-CUSTOM';
    let deviceName = body.deviceName || 'Custom Spec Verification Test';

    // If deviceId provided and claimed is empty, pre-fill from internal database
    if (deviceId && (!claimed || Object.keys(claimed).length === 0)) {
      const device = getDeviceById(deviceId);
      if (device) {
        deviceName = device.name;
        claimed = {
          text: device.specs.text,
          numeric: device.specs.numeric,
        };
      }
    }

    // Default reference specs if not provided
    if (!reference) {
      reference = {
        text: {
          display: '6.7-inch Super Retina XDR OLED 120Hz ProMotion',
          processor: 'Octa-core 3.4GHz 3nm Bionic Processor',
          os: 'v18.1 Enterprise Secure OS',
          water_resistance: 'IP68 water resistant up to 6m for 30 minutes',
          camera_main: '48MP f/1.78 main sensor with sensor-shift OIS',
          build_material: 'Titanium aerospace frame with Ceramic Glass',
        },
        numeric: {
          ram_gb: 12,
          storage_gb: 512,
          battery_mah: 4850,
          weight_grams: 221,
          screen_size_inches: 6.7,
          refresh_rate_hz: 120,
        },
      };
    }

    const report = await performHybridVerification({
      deviceId,
      deviceName,
      claimed,
      reference,
      threshold: body.threshold !== undefined ? Number(body.threshold) : 0.85,
      enableSemanticCheck: body.enableSemanticCheck !== false,
    });

    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Verification failed', details: error.message },
      { status: 500 }
    );
  }
}
