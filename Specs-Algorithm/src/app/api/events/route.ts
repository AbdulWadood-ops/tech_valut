import { NextRequest } from 'next/server';
import { getDevicesDB, updateDeviceStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial heartbeat
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`)
      );

      const allDevices = getDevicesDB();
      const interval = setInterval(() => {
        if (allDevices.length === 0) return;

        // Pick 1-3 random devices to update metrics or status
        const randomIndex = Math.floor(Math.random() * Math.min(100, allDevices.length));
        const device = allDevices[randomIndex];
        if (!device) return;

        const statuses: Array<'active' | 'maintenance' | 'offline' | 'updating'> = [
          'active',
          'maintenance',
          'offline',
          'updating',
        ];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const searchDelta = Math.floor(Math.random() * 5) + 1;
        const requestDelta = Math.floor(Math.random() * 3) + 1;

        device.status = newStatus;
        device.searchCount += searchDelta;
        device.requestCount += requestDelta;
        device.lastAccessedHoursAgo = 0.05; // Just accessed

        const deltaPayload = {
          type: 'device:update',
          id: device.id,
          deviceId: device.deviceId,
          status: device.status,
          searchCount: device.searchCount,
          requestCount: device.requestCount,
          lastAccessedHoursAgo: device.lastAccessedHoursAgo,
          timestamp: new Date().toISOString(),
        };

        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(deltaPayload)}\n\n`));
        } catch (e) {
          clearInterval(interval);
        }
      }, 3000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
