const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio'); // Requires cheerio to be installed

const brandsDir = path.join(__dirname, '..', 'src', 'data', 'brands');

async function fetchLiveScore(device) {
  try {
    const query = encodeURIComponent(`${device.name} antutu score`);
    const url = `https://html.duckduckgo.com/html/?q=${query}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from search engine: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let score = null;
    let foundScore = false;

    $('.result__snippet').each((i, el) => {
      if (foundScore) return;
      
      const text = $(el).text().toLowerCase();
      const scoreMatch = text.match(/(?:antutu|score)[\s\S]{0,30}?((?:[1-9]\d{0,2})(?:,\d{3}){1,2}|[1-9]\d{5,6})/i);
      
      if (scoreMatch && scoreMatch[1]) {
        let rawNumber = parseInt(scoreMatch[1].replace(/,/g, ''), 10);
        if (rawNumber > 50000 && rawNumber < 4000000) {
          if (rawNumber >= 1000000) {
            score = (rawNumber / 1000000).toFixed(2) + 'M';
          } else {
            score = Math.round(rawNumber / 1000) + 'K';
          }
          foundScore = true;
        }
      }
      
      if (!foundScore) {
        const millionMatch = text.match(/(?:antutu|score)[\s\S]{0,30}?(\d+\.\d+|\d+)\s*million/i);
        if (millionMatch && millionMatch[1]) {
          const num = parseFloat(millionMatch[1]);
          if (num > 0.5 && num < 4) {
             score = num.toFixed(2) + 'M';
             foundScore = true;
          }
        }
      }
    });
    
    return score;
  } catch (err) {
    console.error(`Error fetching score for ${device.name}:`, err.message);
    return null;
  }
}

async function updateScores() {
  console.log('Scanning for devices needing live score fetch...');
  
  const files = fs.readdirSync(brandsDir);
  let updatedCount = 0;
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const filePath = path.join(brandsDir, file);
    const devices = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let fileUpdated = false;
    
    // We only process a max number of devices per run to avoid IP blocking
    // For this demonstration, we'll just process up to 3 devices per brand that have dummy scores
    let brandUpdatedCount = 0;
    
    for (const device of devices) {
      if (brandUpdatedCount >= 3) break; // Limit per brand
      
      if (device.performance && device.performance.isDummy) {
        console.log(`Fetching live score for: ${device.brand} ${device.name}...`);
        
        const score = await fetchLiveScore(device);
        
        if (score) {
          console.log(`-> Found score: ${score}`);
          device.performance.antutuScore = score;
          delete device.performance.isDummy;
          fileUpdated = true;
          updatedCount++;
          brandUpdatedCount++;
        } else {
          console.log(`-> No clear score found.`);
        }
        
        // Sleep to avoid rate limiting
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    
    if (fileUpdated) {
      fs.writeFileSync(filePath, JSON.stringify(devices, null, 2));
    }
  }
  
  console.log(`Finished updating ${updatedCount} devices with live AnTuTu scores.`);
}

updateScores().catch(console.error);
