# ⚡ High-Performance C++ Algorithmic Engines + Next.js Integration

This repository contains the complete, battle-tested, high-performance algorithms and architecture modules ready for direct injection into your Next.js application.

---

## 🏗️ System Architecture

```
┌─────────────┐     ┌────────────────┐     ┌───────────────┐     ┌─────────────┐
│  MongoDB     │────▶│  C++ Engines   │────▶│  Redis         │────▶│  Next.js    │
│ (raw data)   │     │ (heavy compute)│     │ (fast reads)   │     │ (SSR + SEO) │
└─────────────┘     └────────────────┘     └───────────────┘     └─────────────┘
```

**Core Design Principle:** All heavy computation (decay math, normalization, Levenshtein edit distance) runs in compiled C++ **outside the request path**. The Next.js frontend only does instant reads from Redis in < 2ms.

---

## 📁 Project Structure & Deliverables

```
Specs-Algorithm/
├── cpp/                                # 🚀 C++ Algorithmic Engines (Compiled with g++ -O3)
│   ├── ranking_engine.hpp              # Header: Normalized exponential decay multi-metric ranking
│   ├── ranking_main.cpp                # Fast CLI / JSON streaming binary for ranking 20,000+ devices
│   ├── verification_engine.hpp         # Header: O(min(N,M)) Levenshtein & relative numeric tolerance
│   ├── verification_main.cpp           # Fast CLI / JSON streaming binary for spec verification
│   ├── mongo_redis_sync.cpp            # Direct C++ MongoDB batch reader & Redis sync engine
│   └── libcurl_fetcher.hpp             # Reference data fetcher
│
├── bin/                                # ⚡ Pre-Compiled Native Windows Binaries
│   ├── ranking_engine.exe              # ~15ms for 20,000 devices
│   ├── verification_engine.exe         # ~0.28ms per device (45,000 fields in 1.4s)
│   └── mongo_redis_sync.exe            # Standalone worker
│
├── injection_modules/                  # 📦 Plug-and-Play Modules for your Next.js App
│   ├── deviceCache.ts                  # Part 1.1: Redis Cache-Aside layer (30s TTL + invalidation)
│   ├── pagination.ts                   # Part 1.2: O(1) Cursor-based MongoDB pagination helper
│   ├── DeviceListVirtual.tsx           # Part 1.3: react-window list virtualization (20k rows)
│   ├── mapClustering.ts                # Part 1.4: Supercluster spatial indexing for maps
│   ├── realtimeDelta.ts                # Part 1.5: WebSocket / SSE delta update patcher
│   ├── rankingBridge.ts                # Part 2.1 & 2.2: C++ ranking runner & Redis ZADD writer
│   ├── rankingReader.ts                # Part 2.3: Next.js Server Component ZREVRANGE reader (SSR/SEO)
│   └── specVerification.ts             # Part 4: C++ Spec verification + Hybrid semantic NLP
│
└── scripts/
    ├── build_cpp.bat                   # 1-Click C++ compilation script
    ├── benchmark_all.bat               # Automated speed & throughput test suite
    └── cron_ranking_worker.js          # Background cron worker running ranking every 60s
```

---

## 🔌 How to Inject into Your Next.js App

### 1. Redis Cache-Aside Layer (`lib/deviceCache.ts`)
Copy `injection_modules/deviceCache.ts` to your app's `lib/deviceCache.ts`:

```typescript
import { getDevicesWithCache, invalidateDeviceCache } from '@/lib/deviceCache';

// Inside your API route (app/api/devices/route.ts):
export async function GET(req: Request) {
  const result = await getDevicesWithCache(DeviceModel, { page: 1, limit: 50 });
  return Response.json(result);
}

// Invalidate whenever a device updates:
await invalidateDeviceCache();
```

---

### 2. Cursor Pagination (`lib/pagination.ts`)
Copy `injection_modules/pagination.ts` to `lib/pagination.ts`:

```typescript
import { paginateByCursor } from '@/lib/pagination';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');

  const { items, nextCursor, hasMore } = await paginateByCursor(DeviceModel, {
    cursor,
    limit: 50,
  });

  return Response.json({ devices: items, nextCursor, hasMore });
}
```

---

### 3. List Virtualization (`components/DeviceListVirtual.tsx`)
Copy `injection_modules/DeviceListVirtual.tsx` into your `components/`:

```tsx
'use client';
import DeviceListVirtual from '@/components/DeviceListVirtual';

export default function MyDevicesPage({ devices }) {
  return (
    <DeviceListVirtual 
      devices={devices} 
      height={600} 
      itemHeight={64} 
      onSelect={(device) => console.log('Selected:', device)}
    />
  );
}
```

---

### 4. C++ Ranking Engine & Redis Sync (`lib/rankingBridge.ts`)
Copy `bin/ranking_engine.exe` and `injection_modules/rankingBridge.ts`:

```typescript
import { rankAndSyncToRedis } from '@/lib/rankingBridge';

// Trigger ranking worker (background job / API trigger):
const stats = await rankAndSyncToRedis(devicesList, {
  w_search: 0.40,
  w_request: 0.40,
  w_recency: 0.20,
  decay_lambda: 0.05,
});

console.log(`Ranked ${stats.processed} devices in ${stats.cppExecutionMs}ms`);
```

---

### 5. Next.js Server Component SEO Reader (`app/devices/page.tsx`)
Fast instant read from Redis sorted set:

```typescript
import { getTopRankedDevices } from '@/lib/rankingReader';

export default async function DevicesPage() {
  const topDevices = await getTopRankedDevices(20);

  return (
    <main>
      <h1>Most Active Devices</h1>
      <ul>
        {topDevices.map((d) => (
          <li key={d.deviceId}>
            #{d.rank} — {d.deviceId} (Score: {d.score.toFixed(3)})
          </li>
        ))}
      </ul>
    </main>
  );
}
```

---

### 6. Spec Verification Engine (`lib/specVerification.ts`)
Copy `bin/verification_engine.exe` and `injection_modules/specVerification.ts`:

```typescript
import { verifyDeviceSpecs } from '@/lib/specVerification';

const report = await verifyDeviceSpecs({
  deviceId: 'DEV-1001',
  deviceName: 'Galaxy S24 Ultra',
  claimed: {
    text: { display: '6.8-inch Dynamic AMOLED 120Hz', water_resistance: 'IP68 waterproof' },
    numeric: { ram_gb: 12, battery_mah: 5000 },
  },
  reference: {
    text: { display: '6.8" Dynamic AMOLED 2X 120Hz', water_resistance: 'IP68 water resistant' },
    numeric: { ram_gb: 12, battery_mah: 5000 },
  },
  threshold: 0.85,
  enableSemanticCheck: true,
});

console.log('Overall Confidence:', report.overallConfidence);
console.log('Verified:', report.verified);
```

---

## 📊 Benchmark Verification

You can verify the C++ engines at any time by running:
```powershell
.\scripts\benchmark_all.bat
```

| Engine | Dataset Size | C++ Execution Time | Throughput |
|---|---|---|---|
| **C++ Ranking Engine** | 20,000 devices | **15.2 ms** | > 1,300,000 devices/sec |
| **C++ Spec Verification** | 5,000 devices (45,000 fields) | **1,403 ms** | **0.28 ms / device** |
| **Redis Server Component Read** | Top 20 / Top 100 | **1.2 ms** | Instant SSR response |
