const fs = require('fs');
const path = require('path');

const BRANDS_FILE = path.join(__dirname, '..', 'brands.json');

// A mapping of brand names to their domains, to get accurate clearbit logos
const DOMAIN_MAP = {
  'apple': 'apple.com',
  'samsung': 'samsung.com',
  'xiaomi': 'mi.com',
  'oneplus': 'oneplus.com',
  'vivo': 'vivo.com',
  'oppo': 'oppo.com',
  'google': 'google.com',
  'sony': 'sony.com',
  'nokia': 'nokia.com',
  'motorola': 'motorola.com',
  'asus': 'asus.com',
  'huawei': 'huawei.com',
  'lg': 'lg.com',
  'lenovo': 'lenovo.com',
  'honor': 'hihonor.com',
  'realme': 'realme.com',
  'zte': 'zte.com.cn',
  'meizu': 'meizu.com',
  'blackberry': 'blackberry.com',
  'htc': 'htc.com',
  'alcatel': 'alcatelmobile.com',
  'panasonic': 'panasonic.com',
  'dell': 'dell.com',
  'hp': 'hp.com',
  'microsoft': 'microsoft.com'
};

async function updateBrands() {
  console.log('Loading brands.json...');
  const data = JSON.parse(fs.readFileSync(BRANDS_FILE, 'utf-8'));
  
  if (!data.RECORDS) {
    console.error('Invalid brands.json format');
    return;
  }
  
  let updatedCount = 0;
  
  for (let brand of data.RECORDS) {
    if (!brand.logo) {
      const name = brand.name.toLowerCase().trim();
      let domain = DOMAIN_MAP[name];
      if (!domain) {
        // Try to construct a simple domain as fallback
        domain = `${name.replace(/[^a-z0-9]/g, '')}.com`;
      }
      brand.logo = `https://logo.clearbit.com/${domain}`;
      updatedCount++;
    }
  }
  
  fs.writeFileSync(BRANDS_FILE, JSON.stringify(data, null, 4));
  console.log(`Successfully updated ${updatedCount} brand logos in brands.json.`);
}

updateBrands().catch(console.error);
