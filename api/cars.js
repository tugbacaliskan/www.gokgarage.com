// api/cars.js — Vercel Serverless Function
// Sahibinden.com'u sunucu tarafında scrape eder.
// Frontend: fetch('/api/cars') ile çağırır.

const GALLERY_URL = 'https://gokgarage.sahibinden.com/';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Vercel CDN 5 dk cache'ler, süresi dolunca arka planda yeniler
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  try {
    const html = await fetchHTML(GALLERY_URL);
    const cars  = parseCars(html);

    if (!cars.length) {
      return res.status(502).json({ error: 'Araç bulunamadı', cars: [] });
    }

    return res.status(200).json({
      _info: {
        last_updated: new Date().toISOString(),
        source: GALLERY_URL,
        count: cars.length,
      },
      cars,
    });
  } catch (err) {
    console.error('Scrape hatası:', err);
    return res.status(500).json({ error: err.message, cars: [] });
  }
}

// ── HTML Fetch ───────────────────────────────────────────────
async function fetchHTML(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'tr-TR,tr;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

// ── HTML Parser ───────────────────────────────────────────────
function parseCars(html) {
  const cars = [];

  // Her ilan <tr class="searchResultsItem" data-id="..."> içinde
  const rowRegex =
    /<tr[^>]+class="[^"]*searchResultsItem[^"]*"[^>]+data-id="(\d+)"([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const id  = rowMatch[1];
    const row = rowMatch[2];

    // URL
    const urlMatch = row.match(/href="(\/ilan\/[^"]+)"/);
    const url = urlMatch ? 'https://sahibinden.com' + urlMatch[1] : '';

    // Görsel — önce data-src, yoksa src
    const imgMatch = row.match(/(?:data-src|src)="(https:\/\/[^"]*shbdn\.com\/photos\/[^"]+)"/);
    let image = imgMatch ? imgMatch[1] : '';
    if (image) image = image.replace(/b\d+\.jpg/, 'b15.jpg');

    // Başlık
    const titleMatch = row.match(/class="[^"]*classifiedTitle[^"]*"[^>]*>\s*([^<]+)/);
    const fullTitle  = titleMatch ? titleMatch[1].trim() : '';

    // Fiyat
    const priceMatch = row.match(
      /class="[^"]*searchResultsPriceValue[^"]*"[^>]*>([\s\S]*?)<\/td>/
    );
    const priceRaw = priceMatch
      ? priceMatch[1].replace(/<[^>]+>/g, '').trim()
      : '';
    const priceNum = parseInt(priceRaw.replace(/[^\d]/g, ''), 10) || 0;

    // Özellikler: yıl, km, vites, yakıt — sırasıyla td.searchResultsAttributeValue
    const attrRegex =
      /class="[^"]*searchResultsAttributeValue[^"]*"[^>]*>([\s\S]*?)<\/td>/g;
    const attrs = [];
    let attrMatch;
    while ((attrMatch = attrRegex.exec(row)) !== null) {
      attrs.push(attrMatch[1].replace(/<[^>]+>/g, '').trim());
    }
    const [year = '', km = '—', transmission = '—', fuel = '—'] = attrs;

    // Rozet (YENİ, ÖZEL vs.)
    const badgeMatch = row.match(/class="[^"]*label[^"]*"[^>]*>\s*([^<]+)/i);
    const badge = badgeMatch ? badgeMatch[1].trim() : '';

    // Marka + temiz başlık
    const brand = extractBrand(fullTitle);
    const title = fullTitle.replace(/^gök\s+garage[\s-]*/i, '').trim() || fullTitle;

    cars.push({
      id,
      brand,
      title,
      variant: '',
      price: priceRaw,
      priceNum,
      km: km || '—',
      year: year || '',
      transmission: transmission || '—',
      fuel: fuel || '—',
      renk: '',
      status: 'active',
      badge,
      image,
      url,
      credit: '',
    });
  }

  return cars;
}

// ── Marka çıkarıcı ───────────────────────────────────────────
const BRANDS = [
  'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Volkswagen', 'Volvo',
  'Honda', 'Toyota', 'Hyundai', 'Kia', 'Ford', 'Renault', 'Peugeot',
  'Fiat', 'Opel', 'Land Rover', 'Jeep', 'Lexus', 'Infiniti',
  'Maserati', 'Ferrari', 'Lamborghini', 'Bentley', 'Rolls-Royce',
  'Doral', 'Tekne',
];

function extractBrand(title) {
  const t = title.toLowerCase();
  for (const b of BRANDS) {
    if (t.includes(b.toLowerCase())) return b;
  }
  return title.split(/\s+/)[0] || '';
}
