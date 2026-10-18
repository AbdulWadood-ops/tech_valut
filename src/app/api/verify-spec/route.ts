import { NextResponse } from 'next/server';
import { verifyDeviceSpecs, SpecVerificationInput } from '@/lib/specVerification';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body: SpecVerificationInput = await request.json();
    if (!body || !body.deviceId) {
      return NextResponse.json({ success: false, error: 'deviceId is required' }, { status: 400 });
    }

    const report = await verifyDeviceSpecs(body);
    return NextResponse.json({
      success: true,
      cppspecDetached: true,
      report,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
