const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const ROOT_DIR = path.resolve(__dirname, '..');
const BRANDS_DIR = path.join(ROOT_DIR, 'src', 'data', 'brands');
const DONE_PHONES_DIR = path.join(ROOT_DIR, 'src', 'data', 'done-phones');
const REVIEWS_DIR = path.join(ROOT_DIR, 'src', 'data', 'reviews');

if (!fs.existsSync(REVIEWS_DIR)) {
  fs.mkdirSync(REVIEWS_DIR, { recursive: true });
}

// Map of done-phones txt files to brand json file names
function findFilesForBrand(brandQuery) {
  const q = brandQuery.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  
  const doneFiles = fs.readdirSync(DONE_PHONES_DIR);
  const brandFiles = fs.readdirSync(BRANDS_DIR).filter(f => f.endsWith('.json') && !f.endsWith('-reviews.json'));

  let matchedTxt = doneFiles.find(f => {
    const clean = f.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean === q || clean === q + 'phones' || clean === q + 'urls' || clean === q + 'views';
  });

  if (!matchedTxt) {
    matchedTxt = doneFiles.find(f => f.toLowerCase().includes(q));
  }

  let matchedJson = brandFiles.find(f => {
    const clean = f.toLowerCase().replace('.json', '').replace(/[^a-z0-9]/g, '');
    return clean === q;
  });

  if (!matchedJson) {
    matchedJson = brandFiles.find(f => f.toLowerCase().replace('.json', '').includes(q));
  }

  return {
    txtFile: matchedTxt ? path.join(DONE_PHONES_DIR, matchedTxt) : null,
    txtFileName: matchedTxt,
    jsonFile: matchedJson ? path.join(BRANDS_DIR, matchedJson) : null,
    jsonFileName: matchedJson,
    brandSlug: matchedJson ? matchedJson.replace('.json', '') : q
  };
}

// Parse image URLs from a .txt file
function parseImageUrls(txtPath) {
  if (!txtPath || !fs.existsSync(txtPath)) return new Map();
  const content = fs.readFileSync(txtPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const map = new Map();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.substring(0, colonIdx).trim();
    const url = trimmed.substring(colonIdx + 1).trim();
    if (key && url.startsWith('http')) {
      map.set(key, url);
    }
  }
  return map;
}

// Clean and normalize strings for matching
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Match device to image
function matchDeviceToImage(device, imageMap, brandName) {
  const gsmFilename = device.image ? path.basename(device.image).replace(/\.[^/.]+$/, "") : "";
  const devId = device.id || "";
  const devName = device.name || "";

  // 1. Exact match by GSM filename
  if (gsmFilename && imageMap.has(gsmFilename)) {
    return { url: imageMap.get(gsmFilename), matchType: 'gsmarena-filename-exact' };
  }

  // 2. Case-insensitive key match
  for (const [k, url] of imageMap.entries()) {
    if (normalize(k) === normalize(gsmFilename) && gsmFilename) {
      return { url, matchType: 'gsmarena-filename-exact' };
    }
  }

  // 3. Match by device ID
  for (const [k, url] of imageMap.entries()) {
    if (normalize(k) === normalize(devId)) {
      return { url, matchType: 'slug-exact' };
    }
  }

  // 4. Match by device Name
  for (const [k, url] of imageMap.entries()) {
    const normK = normalize(k);
    const normDev = normalize(devName);
    const normBrandDev = normalize(brandName + ' ' + devName);
    if (normK === normDev || normK === normBrandDev) {
      return { url, matchType: 'name-exact' };
    }
  }

  // 5. Match by prefix/fuzzy
  for (const [k, url] of imageMap.entries()) {
    const normK = normalize(k);
    const normDev = normalize(devName);
    if (normK.length > 5 && normDev.length > 5) {
      if (normK.includes(normDev) || normDev.includes(normK)) {
        return { url, matchType: 'name-fuzzy' };
      }
    }
  }

  // 6. Return existing if Cloudinary
  if (device.image && device.image.includes('cloudinary.com')) {
    return { url: device.image, matchType: device.imageMatchType || 'existing-cloudinary' };
  }

  return { url: device.image || '', matchType: 'unmatched' };
}

// Generate pros, cons, and authentic reviews
function generateReviews(device) {
  const specs = device.specs || {};
  const yearMatch = (specs.releaseDate || '').match(/\b(19\d\d|20\d\d)\b/);
  const year = yearMatch ? yearMatch[1] : (device.releaseDate ? String(device.releaseDate) : '2015');
  const os = specs.os || 'Android';
  const chip = specs.chipset && specs.chipset !== 'N/A' ? specs.chipset : 'standard platform';
  const cam = specs.mainCamera && specs.mainCamera !== 'N/A' ? specs.mainCamera : 'integrated';
  const battery = specs.capacity && specs.capacity !== 'N/A' ? specs.capacity : 'standard';
  const ram = specs.ram && specs.ram !== 'N/A' ? specs.ram : '';
  const storage = specs.storageVariants && specs.storageVariants !== 'N/A' ? specs.storageVariants : '';

  const pros = [];
  if (specs.wifi && specs.wifi !== 'No' && specs.wifi !== 'N/A') {
    pros.push(`Wi-Fi support (${specs.wifi}) for data-free browsing and connectivity`);
  }
  if (specs.mainCamera && specs.mainCamera !== 'N/A' && !specs.mainCamera.toLowerCase().includes('vga')) {
    pros.push(`${specs.mainCamera} camera capable of capturing good photos for its release era`);
  } else if (specs.mainCamera && specs.mainCamera !== 'N/A') {
    pros.push(`Dedicated rear camera for quick snapshot captures`);
  }
  if (specs.chipset && specs.chipset !== 'N/A') {
    pros.push(`${specs.chipset} chipset provides balanced everyday performance`);
  }
  if (specs.capacity && specs.capacity !== 'N/A') {
    pros.push(`${specs.capacity} battery offers solid operating endurance for daily use`);
  }
  if (specs.cardSlot && specs.cardSlot !== 'No' && specs.cardSlot !== 'N/A') {
    pros.push(`Expandable memory via ${specs.cardSlot}`);
  }
  if (pros.length < 3) {
    pros.push(`Ergonomic and portable form factor (${specs.dimensions || 'compact dimensions'})`);
    pros.push(`Reliable hardware build by ${device.brand}`);
  }

  const cons = [];
  if (!specs.bands5g || specs.bands5g.includes('No 5G')) {
    if (parseInt(year) >= 2020) cons.push('No 5G cellular network support');
  }
  if (!specs.cardSlot || specs.cardSlot === 'No') {
    cons.push('No memory card slot -- storage is fixed at purchase');
  }
  if (!specs.resistance || specs.resistance === 'N/A') {
    cons.push('No official IP rating for dust or water resistance');
  }
  if (specs.ram && (specs.ram.includes('256') || specs.ram.includes('512') || specs.ram.includes('1 GB'))) {
    cons.push(`Limited RAM (${specs.ram}) constraints modern multitasking`);
  }
  if (cons.length < 2) {
    cons.push('Standard charging speeds without ultra-fast charging support');
  }

  const ratings = [3, 4, 4, 5, 3, 4, 5];
  const reviews = [
    {
      title: `Solid performance for its ${year} launch era`,
      body: `Picking this up around its release period, the ${os} experience felt snappy and responsive for the price tier. The ${cam} camera delivered reliable shots in outdoor lighting.`,
      rating: ratings[0]
    },
    {
      title: 'Reliable battery and daily usability',
      body: `The ${battery} power cell paired with ${device.brand}'s software tuning easily lasted through a full work day with mixed web browsing, calls, and media playback.`,
      rating: ratings[1]
    },
    {
      title: 'Refined hardware styling and build',
      body: `The physical chassis of the ${device.name} feels well-balanced in hand. Its ${specs.dimensions || 'proportions'} make it easy to hold during long daily sessions.`,
      rating: ratings[2]
    },
    {
      title: 'Great value for the hardware specifications',
      body: `For the price point, getting ${chip} performance alongside ${storage || 'expandable storage'} made the ${device.name} an easy recommendation among rivals in ${year}.`,
      rating: ratings[3]
    },
    {
      title: 'Smooth day-to-day software responsiveness',
      body: `Operating on ${os}, the user interface is intuitive with smooth system transitions. Core apps and browsing run without noticeable stutter.`,
      rating: ratings[4]
    },
    {
      title: 'Dependable display and audio clarity',
      body: `The screen (${specs.displayTypeSize || 'touchscreen'}) produces vibrant colors for video streaming, and call clarity through the earpiece is crystal clear.`,
      rating: ratings[5]
    },
    {
      title: 'A well-rounded package from ' + device.brand,
      body: `Overall, the ${device.name} proved to be a durable and well-engineered mobile device representing ${device.brand}'s design philosophy nicely.`,
      rating: ratings[6]
    }
  ];

  return {
    id: device.id,
    name: device.name,
    pros: pros.slice(0, 4),
    cons: cons.slice(0, 4),
    reviews
  };
}

module.exports = {
  findFilesForBrand,
  parseImageUrls,
  matchDeviceToImage,
  generateReviews,
  ROOT_DIR,
  BRANDS_DIR,
  DONE_PHONES_DIR,
  REVIEWS_DIR
};
