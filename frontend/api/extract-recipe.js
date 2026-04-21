import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Strip HTML tags and collapse whitespace to get readable text
function extractText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Pull og:image or first large <img> src from raw HTML
function extractPhotoUrl(html, baseUrl) {
  const ogMatch = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (ogMatch) return ogMatch[1];

  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch) {
    const src = imgMatch[1];
    if (src.startsWith('http')) return src;
    try {
      return new URL(src, baseUrl).href;
    } catch { return null; }
  }
  return null;
}

// Pull JSON-LD structured recipe data if available
function extractJsonLd(html) {
  const matches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of matches) {
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data : [data, ...(data['@graph'] || [])];
      const recipe = items.find(i => i['@type'] === 'Recipe' || i?.['@type']?.includes?.('Recipe'));
      if (recipe) return recipe;
    } catch { /* continue */ }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'URL is required' });

  // --- 1. Fetch the webpage ---
  let html;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch (err) {
    return res.status(400).json({ error: `Could not fetch that URL: ${err.message}` });
  }

  const photoUrl = extractPhotoUrl(html, url);
  const jsonLd = extractJsonLd(html);
  const pageText = extractText(html).slice(0, 12000);

  // --- 2. Build context for Claude ---
  const context = jsonLd
    ? `Structured recipe data found on page:\n${JSON.stringify(jsonLd, null, 2).slice(0, 8000)}`
    : `Page text content:\n${pageText}`;

  // --- 3. Call Claude to extract / estimate ---
  let message;
  try {
    message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: `You are a recipe extraction assistant. Extract recipe data from webpage content and return it as a single valid JSON object — no markdown, no explanation, just JSON.

If nutritional macros are not present, estimate them realistically based on the ingredients and serving size.
If tips are not present, leave the array empty.
Use only these units: g, ml, cup, tbsp, tsp, piece, handful, pinch.
Tags should include meal type (breakfast/lunch/dinner/snack), diet info (gluten-free, dairy-free, vegetarian, vegan, high-protein, low-carb), and cooking method where relevant.`,
      messages: [{
        role: 'user',
        content: `Extract the recipe from this content. Source URL: ${url}

${context}

Return this exact JSON shape:
{
  "title": "string",
  "servings": number,
  "prep_time_mins": number | null,
  "cook_time_mins": number | null,
  "ingredients": [{"qty": "string", "unit": "string", "name": "string"}],
  "method_steps": [{"step": number, "text": "string"}],
  "tips": [{"text": "string"}],
  "calories": number | null,
  "protein_g": number | null,
  "carbs_g": number | null,
  "fat_g": number | null,
  "fibre_g": number | null,
  "tags": ["string"]
}`,
      }],
    });
  } catch (err) {
    return res.status(500).json({ error: `Claude API error: ${err.message}` });
  }

  // --- 4. Parse and return ---
  const raw = message.content[0]?.text?.trim() || '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return res.status(500).json({ error: 'Could not parse recipe from page. Try a different URL.' });
  }

  try {
    const recipe = JSON.parse(jsonMatch[0]);
    recipe.source_url = url;
    recipe.source_type = 'url';
    if (photoUrl && !recipe.photo_url) recipe.photo_url = photoUrl;
    return res.status(200).json({ recipe });
  } catch {
    return res.status(500).json({ error: 'Failed to parse extracted recipe data.' });
  }
}
