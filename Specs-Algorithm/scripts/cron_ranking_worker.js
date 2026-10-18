/**
 * Standalone Background Ranking Worker
 * 
 * Runs the C++ Ranking Engine periodically (every 1 to 5 minutes)
 * or can be triggered via node / cron.
 * 
 * Usage:
 *   node scripts/cron_ranking_worker.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BIN_PATH = path.join(__dirname, '..', 'bin', 'ranking_engine.exe');
const INTERVAL_SECONDS = 60; // Run every 60s

console.log('====================================================');
console.log('🚀 Device Ranking C++ Background Worker Initialized');
console.log(`⏱️  Frequency: Every ${INTERVAL_SECONDS} seconds`);
console.log(`📁 Binary: ${BIN_PATH}`);
console.log('====================================================\n');

async function runRankingCycle() {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] Starting ranking cycle...`);

  if (!fs.existsSync(BIN_PATH)) {
    console.error(`❌ Binary not found at ${BIN_PATH}. Please run scripts/build_cpp.bat first.`);
    return;
  }

  const child = spawn(BIN_PATH, ['--benchmark', '--count=20000']);
  let output = '';

  child.stdout.on('data', (data) => {
    output += data.toString();
  });

  child.on('close', (code) => {
    if (code === 0) {
      try {
        const parsed = JSON.parse(output);
        console.log(`✅ [${timestamp}] Ranked ${parsed.processedCount} devices in ${parsed.executionTimeMs} ms.`);
        console.log(`   Top 1: ${parsed.results[0]?.name || parsed.results[0]?.deviceId} (Score: ${parsed.results[0]?.score})`);
      } catch {
        console.log(`✅ [${timestamp}] Ranking completed successfully.`);
      }
    } else {
      console.error(`❌ Ranking process exited with code ${code}`);
    }
  });
}

// Initial run
runRankingCycle();

// Schedule recurring
setInterval(runRankingCycle, INTERVAL_SECONDS * 1000);
