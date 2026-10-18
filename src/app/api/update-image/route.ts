import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getMongoClientSafe } from '@/lib/mongodb';

export const runtime = 'nodejs';

// Detect if filesystem is writable (containers like Zoho/Vercel are read-only)
function isFilesystemWritable(): boolean {
  try {
    const testPath = path.join(process.cwd(), '.write-test');
    fs.writeFileSync(testPath, 'test');
    fs.unlinkSync(testPath);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { deviceId, brandSlug, newImageUrl } = await request.json();

    if (!deviceId || !brandSlug || !newImageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields (deviceId, brandSlug, newImageUrl)' },
        { status: 400 }
      );
    }

    // ── Try MongoDB update first (works on any platform) ──────────────────────
    const client = await getMongoClientSafe();
    if (client) {
      const db = client.db('appdb');
      const result = await db.collection('devices').updateOne(
        { id: deviceId },
        { $set: { image: newImageUrl, updatedAt: new Date() } }
      );
      if (result.matchedCount > 0) {
        return NextResponse.json({ success: true, message: 'Image updated in MongoDB successfully', source: 'mongodb' });
      }
    }

    // ── Fallback: local JSON file update (only works if filesystem is writable) ─
    if (!isFilesystemWritable()) {
      return NextResponse.json(
        {
          error: 'Filesystem is read-only on this platform. Image update requires a writable MongoDB connection.',
          hint: 'Ensure MONGODB_URI is set correctly in Zoho Catalyst environment variables.',
        },
        { status: 503 }
      );
    }

    // Resolve the path to the brand JSON file
    const dataDir = path.join(process.cwd(), 'src', 'data', 'brands');
    const brandFilePath = path.join(dataDir, `${brandSlug}.json`);

    if (!fs.existsSync(brandFilePath)) {
      return NextResponse.json(
        { error: `Brand file not found for ${brandSlug}` },
        { status: 404 }
      );
    }

    // Read and parse the file
    const fileData = fs.readFileSync(brandFilePath, 'utf-8');
    let devices = [];
    try {
      devices = JSON.parse(fileData);
    } catch (e) {
      return NextResponse.json(
        { error: `Failed to parse ${brandSlug}.json` },
        { status: 500 }
      );
    }

    // Find the device and update the image
    let deviceFound = false;
    for (let i = 0; i < devices.length; i++) {
      if (devices[i].id === deviceId) {
        devices[i].image = newImageUrl;
        deviceFound = true;
        break;
      }
    }

    if (!deviceFound) {
      return NextResponse.json(
        { error: `Device with ID ${deviceId} not found in ${brandSlug}.json` },
        { status: 404 }
      );
    }

    // Write the updated data back to the file
    fs.writeFileSync(brandFilePath, JSON.stringify(devices, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Image updated successfully', source: 'local-file' });
  } catch (error: any) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
