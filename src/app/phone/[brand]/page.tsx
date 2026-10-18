import { redirect } from 'next/navigation';
import { getDeviceById } from '../../../lib/db';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ brand: string }>;
}

export default async function PhoneBrandRootPage({ params }: Props) {
  const { brand } = await params;
  const clean = decodeURIComponent(brand).toLowerCase().trim();

  if (clean === 'all') {
    return redirect('/devices');
  }

  // If this matches a device id, route to its specs page
  try {
    const device = await getDeviceById(clean);
    if (device) {
      return redirect(`/device/${device.id}`);
    }
  } catch {
    // Ignore error and proceed to brand pagination
  }

  return redirect(`/phone/${encodeURIComponent(clean)}/p1`);
}

