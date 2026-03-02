/**
 * Geocoding Service — OpenStreetMap Nominatim (gratuit, sans clé API)
 * Forward geocoding: adresse → coordonnées
 * Reverse geocoding: coordonnées → adresse
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// Respecter la politique d'utilisation Nominatim : 1 requête/sec max
let lastRequestTime = 0;
async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1100) {
    await new Promise(resolve => setTimeout(resolve, 1100 - elapsed));
  }
  lastRequestTime = Date.now();
}

/**
 * Recherche d'adresse (forward geocoding)
 * @param {string} query - Texte de recherche (adresse, ville, quartier...)
 * @param {object} options - Options de recherche
 * @param {string} options.countrycodes - Codes pays (ex: 'ci,sn,ml,bf,gn')
 * @param {number} options.limit - Nombre max de résultats (défaut: 5)
 * @returns {Promise<Array<{lat: number, lng: number, displayName: string, address: object}>>}
 */
export async function searchAddress(query, options = {}) {
  if (!query || query.trim().length < 2) return [];

  await throttle();

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: String(options.limit || 5),
    'accept-language': 'fr',
  });

  // Restreindre aux pays d'Afrique de l'Ouest par défaut
  if (options.countrycodes) {
    params.set('countrycodes', options.countrycodes);
  } else {
    params.set('countrycodes', 'ci,sn,ml,bf,gn,gh,ng,cm,tg,bj');
  }

  try {
    const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: { 'User-Agent': 'PlanB-App/1.0' }
    });
    
    if (!response.ok) throw new Error(`Nominatim error: ${response.status}`);

    const results = await response.json();
    return results.map(r => ({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      displayName: r.display_name,
      address: {
        country: r.address?.country || '',
        countryCode: (r.address?.country_code || '').toUpperCase(),
        city: r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || '',
        suburb: r.address?.suburb || r.address?.neighbourhood || r.address?.quarter || '',
        road: r.address?.road || '',
        houseNumber: r.address?.house_number || '',
      },
      boundingBox: r.boundingbox ? r.boundingbox.map(Number) : null,
      type: r.type,
    }));
  } catch (err) {
    console.error('Geocoding search error:', err);
    return [];
  }
}

/**
 * Reverse geocoding (coordonnées → adresse)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{displayName: string, address: object}|null>}
 */
export async function reverseGeocode(lat, lng) {
  if (lat == null || lng == null) return null;

  await throttle();

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
    'accept-language': 'fr',
    zoom: '18',
  });

  try {
    const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
      headers: { 'User-Agent': 'PlanB-App/1.0' }
    });
    
    if (!response.ok) throw new Error(`Nominatim error: ${response.status}`);

    const r = await response.json();
    if (r.error) return null;

    return {
      displayName: r.display_name,
      address: {
        country: r.address?.country || '',
        countryCode: (r.address?.country_code || '').toUpperCase(),
        city: r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || '',
        suburb: r.address?.suburb || r.address?.neighbourhood || r.address?.quarter || '',
        road: r.address?.road || '',
        houseNumber: r.address?.house_number || '',
      },
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    };
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return null;
  }
}

/**
 * Mapper le code pays Nominatim → nom pays PlanB
 */
const COUNTRY_CODE_TO_NAME = {
  CI: "Côte d'Ivoire",
  SN: 'Sénégal',
  ML: 'Mali',
  BF: 'Burkina Faso',
  GN: 'Guinée',
  GH: 'Ghana',
  NG: 'Nigeria',
  CM: 'Cameroun',
  TG: 'Togo',
  BJ: 'Bénin',
};

const NAME_TO_COUNTRY_CODE = Object.fromEntries(
  Object.entries(COUNTRY_CODE_TO_NAME).map(([k, v]) => [v, k])
);

export function countryCodeToName(code) {
  return COUNTRY_CODE_TO_NAME[code?.toUpperCase()] || code;
}

export function countryNameToCode(name) {
  return NAME_TO_COUNTRY_CODE[name] || name;
}
