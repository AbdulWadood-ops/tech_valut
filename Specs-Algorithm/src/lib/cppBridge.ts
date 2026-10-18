import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { RankedDevice, VerificationReport } from './types';

// Paths to compiled C++ executables
const PROJECT_ROOT = process.cwd();
const BIN_DIR = path.join(PROJECT_ROOT, 'bin');
const RANKING_BIN = path.join(BIN_DIR, 'ranking_engine.exe');
const VERIFICATION_BIN = path.join(BIN_DIR, 'verification_engine.exe');

export interface RankingEngineOutput {
  engine: string;
  processedCount: number;
  executionTimeMs: number;
  results: RankedDevice[];
}

// Execute C++ Ranking Engine binary
export async function runCppRankingEngine(
  devices: any[],
  weights = { search: 0.4, request: 0.4, recency: 0.2, decayLambda: 0.05 }
): Promise<RankingEngineOutput> {
  const startTime = performance.now();

  // Check if C++ binary is available
  if (fs.existsSync(RANKING_BIN)) {
    return new Promise((resolve, reject) => {
      const child = spawn(RANKING_BIN, [], {
        cwd: PROJECT_ROOT,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          console.warn(`[C++ Ranking] Exited with code ${code}, stderr: ${stderrData}`);
          return resolve(runFallbackJsRanking(devices, weights));
        }

        try {
          const parsed: RankingEngineOutput = JSON.parse(stdoutData);
          resolve(parsed);
        } catch (err) {
          console.error('[C++ Ranking] JSON parse failed, using fallback:', err);
          resolve(runFallbackJsRanking(devices, weights));
        }
      });

      child.on('error', (err) => {
        console.warn('[C++ Ranking] Spawn error, using fallback:', err.message);
        resolve(runFallbackJsRanking(devices, weights));
      });

      // Write devices as JSON array into C++ stdin
      child.stdin.write(JSON.stringify(devices));
      child.stdin.end();
    });
  }

  // Pure TypeScript fallback algorithm
  return runFallbackJsRanking(devices, weights);
}

// High-performance fallback ranking mirror
function runFallbackJsRanking(
  devices: any[],
  weights = { search: 0.4, request: 0.4, recency: 0.2, decayLambda: 0.05 }
): RankingEngineOutput {
  const start = performance.now();
  let maxSearch = 0;
  let maxRequest = 0;

  for (const d of devices) {
    if (d.searchCount > maxSearch) maxSearch = d.searchCount;
    if (d.requestCount > maxRequest) maxRequest = d.requestCount;
  }

  const results: RankedDevice[] = devices.map((d) => {
    const searchScore = maxSearch > 0 ? d.searchCount / maxSearch : 0;
    const requestScore = maxRequest > 0 ? d.requestCount / maxRequest : 0;
    const recencyScore = Math.exp(-weights.decayLambda * Math.max(0, d.lastAccessedHoursAgo || 0));
    const score = weights.search * searchScore + weights.request * requestScore + weights.recency * recencyScore;

    return {
      rank: 0,
      deviceId: d.deviceId || d.id,
      name: d.name,
      brand: d.brand,
      category: d.category,
      score,
      searchScore,
      requestScore,
      recencyScore,
      searchCount: d.searchCount,
      requestCount: d.requestCount,
      lastAccessedHoursAgo: d.lastAccessedHoursAgo || 0,
    };
  });

  results.sort((a, b) => b.score - a.score);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  const duration = performance.now() - start;
  return {
    engine: 'C++ Ranking Engine (JIT TS Mirror)',
    processedCount: results.length,
    executionTimeMs: Number(duration.toFixed(4)),
    results,
  };
}

// Execute C++ Verification Engine binary
export async function runCppVerificationEngine(payload: {
  deviceId: string;
  deviceName: string;
  claimed: { text?: Record<string, string>; numeric?: Record<string, number> };
  reference: { text?: Record<string, string>; numeric?: Record<string, number> };
  threshold?: number;
}): Promise<VerificationReport> {
  if (fs.existsSync(VERIFICATION_BIN)) {
    return new Promise((resolve) => {
      const child = spawn(VERIFICATION_BIN, [], {
        cwd: PROJECT_ROOT,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          console.warn(`[C++ Verification] Process exited ${code}, using JS fallback.`);
          return resolve(runFallbackJsVerification(payload));
        }

        try {
          const parsed: VerificationReport = JSON.parse(stdoutData);
          resolve(parsed);
        } catch (err) {
          console.error('[C++ Verification] JSON parse error, using fallback:', err);
          resolve(runFallbackJsVerification(payload));
        }
      });

      child.on('error', (err) => {
        console.warn('[C++ Verification] Spawn failed, using fallback:', err.message);
        resolve(runFallbackJsVerification(payload));
      });

      child.stdin.write(JSON.stringify(payload));
      child.stdin.end();
    });
  }

  return runFallbackJsVerification(payload);
}

// TS mirror of Levenshtein and Spec verification algorithm
function runFallbackJsVerification(payload: {
  deviceId: string;
  deviceName: string;
  claimed: { text?: Record<string, string>; numeric?: Record<string, number> };
  reference: { text?: Record<string, string>; numeric?: Record<string, number> };
  threshold?: number;
}): VerificationReport {
  const start = performance.now();
  const threshold = payload.threshold || 0.85;
  const fields: VerificationReport['fields'] = [];
  let totalScore = 0;
  let totalChecked = 0;
  let flaggedCount = 0;

  const textClaimed = payload.claimed.text || {};
  const textRef = payload.reference.text || {};

  for (const [key, claimedVal] of Object.entries(textClaimed)) {
    if (textRef[key] !== undefined) {
      const refVal = textRef[key];
      const dist = levenshtein(claimedVal, refVal);
      const maxLen = Math.max(claimedVal.length, refVal.length);
      const score = maxLen === 0 ? 1.0 : Math.max(0, 1.0 - dist / maxLen);
      const flagged = score < threshold;

      fields.push({
        fieldName: key,
        type: 'text',
        claimedValue: claimedVal,
        referenceValue: refVal,
        similarityScore: Number(score.toFixed(4)),
        flagged,
        mismatchReason: flagged ? `Text similarity ${(score * 100).toFixed(1)}% is below threshold` : 'Match within threshold',
      });

      totalScore += score;
      totalChecked++;
      if (flagged) flaggedCount++;
    }
  }

  const numClaimed = payload.claimed.numeric || {};
  const numRef = payload.reference.numeric || {};

  for (const [key, claimedVal] of Object.entries(numClaimed)) {
    if (numRef[key] !== undefined) {
      const refVal = numRef[key];
      const diff = refVal === 0 ? (claimedVal === 0 ? 0 : 1) : Math.abs(claimedVal - refVal) / Math.abs(refVal);
      const score = Math.max(0, 1.0 - diff);
      const flagged = score < threshold;

      fields.push({
        fieldName: key,
        type: 'numeric',
        claimedValue: String(claimedVal),
        referenceValue: String(refVal),
        similarityScore: Number(score.toFixed(4)),
        flagged,
        mismatchReason: flagged
          ? `Discrepancy of ${(diff * 100).toFixed(1)}% (${claimedVal} vs ${refVal})`
          : 'Numerical match within tolerance',
      });

      totalScore += score;
      totalChecked++;
      if (flagged) flaggedCount++;
    }
  }

  const overallConfidence = totalChecked > 0 ? Number((totalScore / totalChecked).toFixed(4)) : 0;
  const elapsed = performance.now() - start;

  return {
    engine: 'C++ Spec Verification Engine (JIT TS Mirror)',
    executionTimeMs: Number(elapsed.toFixed(4)),
    deviceId: payload.deviceId,
    deviceName: payload.deviceName,
    overallConfidence,
    totalChecked,
    flaggedCount,
    verified: overallConfidence >= threshold && flaggedCount === 0,
    fields,
  };
}

function levenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = Array.from({ length: al + 1 }, () => Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) matrix[i][0] = i;
  for (let j = 0; j <= bl; j++) matrix[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[al][bl];
}
