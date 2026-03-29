// api/category.js
// Returns styles matching a search term, filtered to only relevant results

// Keywords that must appear in baseCategory or title for each main category
const CATEGORY_FILTERS = {
  'Shorts':      ['short'],
  'T-Shirts':    ['t-shirt', 'tee', 'tshirt'],
  'Polos':       ['polo'],
  'Sweatshirts': ['sweatshirt', 'hoodie', 'fleece', 'pullover', 'crewneck', 'zip'],
  'Jackets':     ['jacket', 'vest', 'anorak', 'windbreaker', 'puffer', 'shell'],
  'Hats':        ['hat', 'cap', 'beanie', 'headwear', 'visor', 'bucket'],
  'Bags':        ['bag', 'backpack', 'tote', 'duffel', 'cinch', 'cooler', 'pack'],
};

// Map subcategory search terms back to their parent for filtering
const SEARCH_TO_CATEGORY = {
  'Shorts':           'Shorts',
  'Athletic Shorts':  'Shorts',
  'Mesh Shorts':      'Shorts',
  'Cotton Shorts':    'Shorts',
  'Ladies Shorts':    'Shorts',
  'Youth Shorts':     'Shorts',
  'T-Shirts':         'T-Shirts',
  'Cotton T-Shirt':   'T-Shirts',
  'Cotton Poly T-Shirt': 'T-Shirts',
  'Performance T-Shirt': 'T-Shirts',
  'Triblend T-Shirt': 'T-Shirts',
  'Long Sleeve T-Shirt': 'T-Shirts',
  'Youth T-Shirt':    'T-Shirts',
  'Ladies T-Shirt':   'T-Shirts',
  'Polos':            'Polos',
  'Performance Polo': 'Polos',
  'Cotton Polo':      'Polos',
  'Pique Polo':       'Polos',
  'Ladies Polo':      'Polos',
  'Youth Polo':       'Polos',
  'Sweatshirts':      'Sweatshirts',
  'Crewneck Sweatshirt': 'Sweatshirts',
  'Hooded Sweatshirt':'Sweatshirts',
  'Full Zip Hoodie':  'Sweatshirts',
  'Quarter Zip':      'Sweatshirts',
  'Youth Hoodie':     'Sweatshirts',
  'Ladies Hoodie':    'Sweatshirts',
  'Jackets':          'Jackets',
  'Soft Shell Jacket':'Jackets',
  'Puffer Jacket':    'Jackets',
  'Wind Jacket':      'Jackets',
  'Rain Jacket':      'Jackets',
  'Fleece Jacket':    'Jackets',
  'Ladies Jacket':    'Jackets',
  'Hats':             'Hats',
  'Structured Cap':   'Hats',
  'Unstructured Cap': 'Hats',
  'Snapback':         'Hats',
  'Flexfit':          'Hats',
  'Trucker Cap':      'Hats',
  'Beanie':           'Hats',
  'Bucket Hat':       'Hats',
  'Bags':             'Bags',
  'Backpack':         'Bags',
  'Tote Bag':         'Bags',
  'Cinch Bag':        'Bags',
  'Duffel Bag':       'Bags',
  'Cooler Bag':       'Bags',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Missing query param: name' });

  const username = process.env.SS_USERNAME;
  const apiKey   = process.env.SS_API_KEY;
  if (!username || !apiKey) return res.status(500).json({ error: 'S&S credentials not configured.' });

  try {
    const response = await fetch(
      `https://api.ssactivewear.com/v2/styles?search=${encodeURIComponent(name)}&mediatype=json`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${username}:${apiKey}`).toString('base64'),
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `S&S API error: ${response.status}`, detail: text });
    }

    const data = await response.json();
    const base = 'https://www.ssactivewear.com/';

    // Determine which category keywords to filter by
    const parentCat = SEARCH_TO_CATEGORY[name];
    const filterWords = parentCat ? CATEGORY_FILTERS[parentCat] : null;

    const styles = (Array.isArray(data) ? data : [])
      .filter(s => {
        if (!filterWords) return true; // no filter for unknown categories
        const cat   = (s.baseCategory || '').toLowerCase();
        const title = (s.title || s.styleName || '').toLowerCase();
        return filterWords.some(w => cat.includes(w) || title.includes(w));
      })
      .map(s => ({
        ...s,
        styleImage: s.styleImage ? base + s.styleImage : '',
        brandImage: s.brandImage ? base + s.brandImage : '',
      }));

    return res.status(200).json(styles);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach S&S API', detail: err.message });
  }
}
