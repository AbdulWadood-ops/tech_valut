const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const brands = require('./brands.json');
const outDir = path.join(process.cwd(), 'public', 'brands');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Map brands to official domain & SimpleIcons slug (if available)
const BRAND_META = {
  'acer': { domain: 'acer.com', icon: 'acer', color: '#83B81A' },
  'alcatel': { domain: 'alcatelmobile.com', color: '#00A3E0' },
  'all': { domain: 'all.com', color: '#6366F1' },
  'allview': { domain: 'allviewmobile.com', color: '#E11D48' },
  'amazon': { domain: 'amazon.com', icon: 'amazon', color: '#FF9900' },
  'amoi': { domain: 'amoi.com', color: '#2563EB' },
  'apex-mobile': { domain: 'apexmobile.com', color: '#4F46E5' },
  'apple': { domain: 'apple.com', icon: 'apple', color: '#FFFFFF' },
  'archos': { domain: 'archos.com', color: '#0084C7' },
  'asus': { domain: 'asus.com', icon: 'asus', color: '#00539B' },
  'at-t': { domain: 'att.com', icon: 'att', color: '#009FDB' },
  'benefon': { domain: 'benefon.com', color: '#0284C7' },
  'benq': { domain: 'benq.com', icon: 'benq', color: '#562580' },
  'benq-siemens': { domain: 'benq.com', color: '#562580' },
  'bird': { domain: 'bird.com.cn', color: '#DC2626' },
  'blackberry': { domain: 'blackberry.com', icon: 'blackberry', color: '#000000' },
  'blackview': { domain: 'blackview.hk', color: '#FF6600' },
  'blu': { domain: 'bluproducts.com', color: '#0072CE' },
  'bosch': { domain: 'bosch.com', icon: 'bosch', color: '#EA1B23' },
  'bq': { domain: 'bq.com', color: '#2C3E50' },
  'casio': { domain: 'casio.com', icon: 'casio', color: '#004B97' },
  'cat': { domain: 'catphones.com', icon: 'caterpillar', color: '#FFCD00' },
  'celkon': { domain: 'celkonmobiles.com', color: '#EF4444' },
  'chea': { domain: 'chea.com', color: '#6366F1' },
  'coolpad': { domain: 'coolpad.com', color: '#0284C7' },
  'cubot': { domain: 'cubot.net', color: '#0D9488' },
  'dell': { domain: 'dell.com', icon: 'dell', color: '#007DB8' },
  'doogee': { domain: 'doogee.cc', color: '#F59E0B' },
  'emporia': { domain: 'emporiamobile.com', color: '#EF4444' },
  'energizer': { domain: 'energizermobile.com', color: '#FFD100' },
  'ericsson': { domain: 'ericsson.com', icon: 'ericsson', color: '#002561' },
  'eten': { domain: 'eten.com', color: '#3B82F6' },
  'fairphone': { domain: 'fairphone.com', icon: 'fairphone', color: '#20A39E' },
  'fujitsu': { domain: 'fujitsu.com', icon: 'fujitsu', color: '#EE0000' },
  'garmin-asus': { domain: 'garmin.com', icon: 'garmin', color: '#007CC3' },
  'gigabyte': { domain: 'gigabyte.com', icon: 'gigabyte', color: '#FF6600' },
  'gionee': { domain: 'gionee.com', color: '#E11D48' },
  'google': { domain: 'google.com', icon: 'google', color: '#4285F4' },
  'haier': { domain: 'haier.com', color: '#005AAA' },
  'hmd': { domain: 'hmd.com', color: '#00A896' },
  'honor': { domain: 'hihonor.com', icon: 'honor', color: '#0080FF' },
  'hp': { domain: 'hp.com', icon: 'hp', color: '#0096D6' },
  'htc': { domain: 'htc.com', icon: 'htc', color: '#85B819' },
  'huawei': { domain: 'huawei.com', icon: 'huawei', color: '#CF0A2C' },
  'i-mate': { domain: 'imate.com', color: '#2563EB' },
  'i-mobile': { domain: 'i-mobilephone.com', color: '#F97316' },
  'icemobile': { domain: 'icemobile.com', color: '#38BDF8' },
  'infinix': { domain: 'infinixmobility.com', color: '#48BB78' },
  'innostream': { domain: 'innostream.com', color: '#6366F1' },
  'inq': { domain: 'inqmobile.com', color: '#EC4899' },
  'intex': { domain: 'intex.in', color: '#E11D48' },
  'itel': { domain: 'itel-life.com', color: '#DC2626' },
  'jolla': { domain: 'jolla.com', icon: 'jolla', color: '#00A3E0' },
  'karbonn': { domain: 'karbonnmobiles.com', color: '#D97706' },
  'kyocera': { domain: 'kyocera.com', icon: 'kyocera', color: '#DE001A' },
  'lava': { domain: 'lavamobiles.com', color: '#DC2626' },
  'leeco': { domain: 'le.com', color: '#2563EB' },
  'lenovo': { domain: 'lenovo.com', icon: 'lenovo', color: '#E2231A' },
  'lg': { domain: 'lg.com', icon: 'lg', color: '#A50034' },
  'maxon': { domain: 'maxon.net', color: '#0284C7' },
  'maxwest': { domain: 'maxwesttelecom.com', color: '#EA580C' },
  'meizu': { domain: 'meizu.com', icon: 'meizu', color: '#008CFF' },
  'micromax': { domain: 'micromaxinfo.com', color: '#EA580C' },
  'microsoft': { domain: 'microsoft.com', icon: 'microsoft', color: '#00A4EF' },
  'mitac': { domain: 'mitac.com', color: '#2563EB' },
  'mitsubishi': { domain: 'mitsubishielectric.com', icon: 'mitsubishi', color: '#E60012' },
  'modu': { domain: 'modumobile.com', color: '#8B5CF6' },
  'motorola': { domain: 'motorola.com', icon: 'motorola', color: '#00142E' },
  'mwg': { domain: 'mwg.com', color: '#3B82F6' },
  'nec': { domain: 'nec.com', icon: 'nec', color: '#1414A0' },
  'neonode': { domain: 'neonode.com', color: '#F43F5E' },
  'niu': { domain: 'niutelecom.com', color: '#059669' },
  'nokia': { domain: 'nokia.com', icon: 'nokia', color: '#124191' },
  'nothing': { domain: 'nothing.tech', color: '#FFFFFF' },
  'nvidia': { domain: 'nvidia.com', icon: 'nvidia', color: '#76B900' },
  'o2': { domain: 'o2.co.uk', icon: 'o2', color: '#0019A5' },
  'oneplus': { domain: 'oneplus.com', icon: 'oneplus', color: '#F50514' },
  'oppo': { domain: 'oppo.com', icon: 'oppo', color: '#046A38' },
  'orange': { domain: 'orange.com', icon: 'orange', color: '#FF7900' },
  'oscal': { domain: 'oscal.hk', color: '#0284C7' },
  'oukitel': { domain: 'oukitel.com', color: '#EA580C' },
  'palm': { domain: 'palm.com', color: '#FA5B31' },
  'panasonic': { domain: 'panasonic.com', icon: 'panasonic', color: '#004098' },
  'pantech': { domain: 'pantech.com', color: '#2563EB' },
  'parla': { domain: 'parlamobile.com', color: '#6366F1' },
  'philips': { domain: 'philips.com', icon: 'philips', color: '#0B5ED7' },
  'plum': { domain: 'plum-mobile.com', color: '#7C3AED' },
  'plump': { domain: 'plum-mobile.com', color: '#7C3AED' },
  'poco': { domain: 'po.co', color: '#FFCE00' },
  'posh': { domain: 'poshmobile.com', color: '#F43F5E' },
  'prestigio': { domain: 'prestigio.com', color: '#881337' },
  'qmobile': { domain: 'qmobile.com.pk', color: '#DC2626' },
  'qtek': { domain: 'qtek.com', color: '#3B82F6' },
  'razer': { domain: 'razer.com', icon: 'razer', color: '#00FF00' },
  'realme': { domain: 'realme.com', icon: 'realme', color: '#FFC915' },
  'redmi': { domain: 'mi.com', icon: 'xiaomi', color: '#FF6900' },
  'rugone': { domain: 'rugone.com', color: '#D97706' },
  'sagem': { domain: 'sagem.com', color: '#0284C7' },
  'samsung': { domain: 'samsung.com', icon: 'samsung', color: '#1428A0' },
  'segam': { domain: 'sagem.com', color: '#0284C7' },
  'sendo': { domain: 'sendo.com', color: '#6366F1' },
  'sewon': { domain: 'sewon.com', color: '#10B981' },
  'sharp': { domain: 'sharp-world.com', icon: 'sharp', color: '#E60012' },
  'siemens': { domain: 'siemens.com', icon: 'siemens', color: '#00646E' },
  'sonim': { domain: 'sonimtech.com', color: '#F59E0B' },
  'sony': { domain: 'sony.com', icon: 'sony', color: '#FFFFFF' },
  'sonyercisson': { domain: 'sonymobile.com', color: '#7CB342' },
  'spice': { domain: 'spicemobile.in', color: '#E11D48' },
  't-mobile': { domain: 't-mobile.com', icon: 'tmobile', color: '#E20074' },
  'tcl': { domain: 'tcl.com', icon: 'tcl', color: '#FF0000' },
  'tecno': { domain: 'tecno-mobile.com', color: '#0083CA' },
  'tel-me': { domain: 'telme.at', color: '#6366F1' },
  'telit': { domain: 'telit.com', color: '#0284C7' },
  'tellme': { domain: 'telme.at', color: '#6366F1' },
  'thuraya': { domain: 'thuraya.com', color: '#2563EB' },
  'toshiba': { domain: 'toshiba.com', icon: 'toshiba', color: '#FF0000' },
  'ulefone': { domain: 'ulefone.com', color: '#FF7A00' },
  'umidigi': { domain: 'umidigi.com', color: '#0D9488' },
  'unnecto': { domain: 'unnecto.com', color: '#6366F1' },
  'vertu': { domain: 'vertu.com', color: '#C0A062' },
  'verykool': { domain: 'verykool.net', color: '#8B5CF6' },
  'vivo': { domain: 'vivo.com', icon: 'vivo', color: '#415FFF' },
  'vk': { domain: 'vkmobile.com', color: '#3B82F6' },
  'vkmobile': { domain: 'vkmobile.com', color: '#3B82F6' },
  'vodafone': { domain: 'vodafone.com', icon: 'vodafone', color: '#E60000' },
  'wiko': { domain: 'wikomobile.com', color: '#00A896' },
  'wnd': { domain: 'wnd.com', color: '#64748B' },
  'xcute': { domain: 'xcute.com', color: '#EC4899' },
  'xiaomi': { domain: 'mi.com', icon: 'xiaomi', color: '#FF6900' },
  'xolo': { domain: 'xolo.in', color: '#E11D48' },
  'yezz': { domain: 'yzz.com', color: '#0284C7' },
  'yota': { domain: 'yotaphone.com', color: '#10B981' },
  'yu': { domain: 'yuplaygod.com', color: '#F59E0B' },
  'zte': { domain: 'ztedevices.com', icon: 'zte', color: '#005BA6' }
};

function fetchUrl(url, maxRedirects = 3) {
  return new Promise((resolve) => {
    if (maxRedirects < 0) return resolve(null);
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let nextUrl = res.headers.location;
        if (!nextUrl.startsWith('http')) {
          const u = new URL(url);
          nextUrl = u.protocol + '//' + u.host + nextUrl;
        }
        return resolve(fetchUrl(nextUrl, maxRedirects - 1));
      }
      if (res.statusCode !== 200) return resolve(null);
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] }));
    }).on('error', () => resolve(null));
  });
}

function generateSvgBadge(name, color = '#7F22FE') {
  const safeName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const letter = name.charAt(0).toUpperCase();
  // Calculate font size according to name length
  const fontSize = name.length > 10 ? 18 : name.length > 7 ? 22 : 26;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="50%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#040405" />
    </linearGradient>
    <linearGradient id="brandGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${color}" stop-opacity="0.05" />
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="200" height="200" rx="44" fill="url(#bgGrad)" />
  <rect width="198" height="198" x="1" y="1" rx="43" fill="none" stroke="${color}" stroke-opacity="0.35" stroke-width="2" />
  
  <!-- Subtle circular ambient glow -->
  <circle cx="100" cy="85" r="55" fill="url(#brandGlow)" />
  
  <!-- Stylized initial monogram -->
  <circle cx="100" cy="80" r="42" fill="#121215" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
  <text x="100" y="96" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="46" font-weight="900" fill="${color}" text-anchor="middle">${letter}</text>

  <!-- Brand Wordmark text -->
  <text x="100" y="156" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="#f4f4f5" text-anchor="middle" letter-spacing="0.5">${safeName}</text>
</svg>`;
}

function wrapSimpleIconSvg(rawSvg, brandName, brandColor) {
  // Extract path from SimpleIcon
  const pathMatch = rawSvg.match(/<path[^>]+d="([^"]+)"/);
  if (!pathMatch) return generateSvgBadge(brandName, brandColor);
  const pathD = pathMatch[1];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="50%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#040405" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${brandColor}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${brandColor}" stop-opacity="0.05" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="44" fill="url(#bg)" />
  <rect width="198" height="198" x="1" y="1" rx="43" fill="none" stroke="${brandColor}" stroke-opacity="0.35" stroke-width="2" />
  <circle cx="100" cy="100" r="65" fill="url(#accent)" />
  
  <!-- Scaled Centered Vector Icon -->
  <g transform="translate(52, 52) scale(4)">
    <path fill="${brandColor === '#000000' || brandColor === '#FFFFFF' ? '#ffffff' : brandColor}" d="${pathD}" />
  </g>
</svg>`;
}

async function processBrand(b) {
  const meta = BRAND_META[b.slug] || { color: '#7F22FE' };
  const destBase = path.join(outDir, b.slug);

  // 1. Try Simple Icons vector logo first (super high quality, scalable)
  if (meta.icon) {
    const iconRes = await fetchUrl(`https://api.iconify.design/simple-icons:${meta.icon}.svg`);
    if (iconRes && iconRes.buffer.length > 50) {
      const svgText = iconRes.buffer.toString('utf-8');
      const compositeSvg = wrapSimpleIconSvg(svgText, b.name, meta.color);
      fs.writeFileSync(`${destBase}.svg`, compositeSvg, 'utf-8');
      return { slug: b.slug, file: `/brands/${b.slug}.svg`, type: 'vector-icon' };
    }
  }

  // 2. Try Google 128px high-res favicon
  if (meta.domain) {
    const favRes = await fetchUrl(`https://www.google.com/s2/favicons?domain=${meta.domain}&sz=128`);
    // Valid PNGs from Google are usually >= 600 bytes (default empty globe is ~300 bytes)
    if (favRes && favRes.buffer.length > 700) {
      fs.writeFileSync(`${destBase}.png`, favRes.buffer);
      return { slug: b.slug, file: `/brands/${b.slug}.png`, type: 'png-favicon' };
    }
  }

  // 3. Fallback: Generate custom premium square SVG badge
  const svgBadge = generateSvgBadge(b.name, meta.color);
  fs.writeFileSync(`${destBase}.svg`, svgBadge, 'utf-8');
  return { slug: b.slug, file: `/brands/${b.slug}.svg`, type: 'svg-badge' };
}

(async () => {
  console.log(`Starting square image creation/download for ${brands.length} brands...`);
  const indexMap = {};
  let vectors = 0;
  let pngs = 0;
  let badges = 0;

  for (let i = 0; i < brands.length; i++) {
    const b = brands[i];
    try {
      const res = await processBrand(b);
      indexMap[b.slug] = res.file;
      if (res.type === 'vector-icon') vectors++;
      else if (res.type === 'png-favicon') pngs++;
      else badges++;

      process.stdout.write(`\rProgress: [${i + 1}/${brands.length}] ${b.name.padEnd(20)} (${res.type})`);
    } catch (e) {
      // Fallback to svg
      const svgBadge = generateSvgBadge(b.name, '#7F22FE');
      fs.writeFileSync(path.join(outDir, `${b.slug}.svg`), svgBadge, 'utf-8');
      indexMap[b.slug] = `/brands/${b.slug}.svg`;
      badges++;
    }
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(indexMap, null, 2));
  console.log('\n\n✅ Done! Summary:');
  console.log(`- Official Vector Logos (SVG): ${vectors}`);
  console.log(`- High-Res Domain Favicons (PNG): ${pngs}`);
  console.log(`- Custom Premium Brand Badges (SVG): ${badges}`);
  console.log(`- Total Images in public/brands: ${Object.keys(indexMap).length}`);
})();
