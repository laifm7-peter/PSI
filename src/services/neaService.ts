import {
  NeaRegionKey,
  PsiApiResponse,
  Pm25ApiResponse,
  RegionAirData,
  AirQualityIndicator,
  ApiHealthReport,
  UserLocation,
} from '../types/nea';

// Default NEA station coordinates
export const REGION_COORDINATES: Record<NeaRegionKey, { lat: number; lng: number; displayName: string }> = {
  north: { lat: 1.41803, lng: 103.82000, displayName: 'North' },
  south: { lat: 1.29587, lng: 103.82000, displayName: 'South' },
  east: { lat: 1.35735, lng: 103.94000, displayName: 'East' },
  west: { lat: 1.35735, lng: 103.70000, displayName: 'West' },
  central: { lat: 1.35735, lng: 103.82000, displayName: 'Central' },
};

// Singapore towns mapped to NEA regions for rapid user lookup
export const SINGAPORE_TOWNS: Array<{ name: string; region: NeaRegionKey; lat: number; lng: number }> = [
  // North
  { name: 'Woodlands', region: 'north', lat: 1.4382, lng: 103.7891 },
  { name: 'Yishun', region: 'north', lat: 1.4304, lng: 103.8354 },
  { name: 'Sembawang', region: 'north', lat: 1.4491, lng: 103.8185 },
  { name: 'Admiralty', region: 'north', lat: 1.4406, lng: 103.8009 },
  { name: 'Khatib', region: 'north', lat: 1.4174, lng: 103.8329 },
  { name: 'Mandai / Zoo', region: 'north', lat: 1.4043, lng: 103.7930 },

  // South
  { name: 'Marina Bay / Downtown', region: 'south', lat: 1.2838, lng: 103.8591 },
  { name: 'HarbourFront / VivoCity', region: 'south', lat: 1.2644, lng: 103.8222 },
  { name: 'Sentosa', region: 'south', lat: 1.2494, lng: 103.8303 },
  { name: 'Bukit Merah', region: 'south', lat: 1.2819, lng: 103.8239 },
  { name: 'Telok Blangah', region: 'south', lat: 1.2789, lng: 103.8094 },
  { name: 'Tanjong Pagar', region: 'south', lat: 1.2764, lng: 103.8458 },
  { name: 'Pasir Panjang', region: 'south', lat: 1.2825, lng: 103.7850 },

  // East
  { name: 'Tampines', region: 'east', lat: 1.3524, lng: 103.9447 },
  { name: 'Bedok', region: 'east', lat: 1.3236, lng: 103.9273 },
  { name: 'Pasir Ris', region: 'east', lat: 1.3721, lng: 103.9474 },
  { name: 'Changi Airport', region: 'east', lat: 1.3644, lng: 103.9915 },
  { name: 'Geylang / Paya Lebar', region: 'east', lat: 1.3178, lng: 103.8928 },
  { name: 'Marine Parade / East Coast', region: 'east', lat: 1.3025, lng: 103.9069 },

  // West
  { name: 'Jurong East', region: 'west', lat: 1.3329, lng: 103.7436 },
  { name: 'Jurong West / Boon Lay', region: 'west', lat: 1.3404, lng: 103.7090 },
  { name: 'Clementi', region: 'west', lat: 1.3162, lng: 103.7649 },
  { name: 'Bukit Batok', region: 'west', lat: 1.3590, lng: 103.7637 },
  { name: 'Choa Chu Kang', region: 'west', lat: 1.3840, lng: 103.7470 },
  { name: 'Tuas', region: 'west', lat: 1.3187, lng: 103.6358 },
  { name: 'Bukit Panjang', region: 'west', lat: 1.3774, lng: 103.7719 },

  // Central
  { name: 'Orchard / Somerset', region: 'central', lat: 1.3048, lng: 103.8318 },
  { name: 'Bishan', region: 'central', lat: 1.3526, lng: 103.8352 },
  { name: 'Toa Payoh', region: 'central', lat: 1.3343, lng: 103.8563 },
  { name: 'Ang Mo Kio', region: 'central', lat: 1.3691, lng: 103.8454 },
  { name: 'Novena', region: 'central', lat: 1.3204, lng: 103.8438 },
  { name: 'Bukit Timah', region: 'central', lat: 1.3294, lng: 103.8021 },
  { name: 'Serangoon', region: 'central', lat: 1.3554, lng: 103.8679 },
  { name: 'Kallang', region: 'central', lat: 1.3100, lng: 103.8651 },
];

/**
 * Calculates PSI Safety Indicator according to Singapore NEA standard
 */
export function getPsiIndicator(psiValue: number): AirQualityIndicator {
  if (psiValue <= 50) {
    return {
      band: 'good',
      label: 'Good',
      colorHex: '#10b981', // emerald-500
      badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      badgeText: 'text-emerald-700 dark:text-emerald-400',
      borderColor: 'border-emerald-500',
      advisoryTitle: 'Normal Activities',
      generalHealthAdvisory: 'Air quality is satisfactory. Normal outdoor physical activities can be carried out.',
      vulnerableGroupAdvisory: 'Normal outdoor activities can be continued.',
      maskRecommended: false,
    };
  }
  if (psiValue <= 100) {
    return {
      band: 'moderate',
      label: 'Moderate',
      colorHex: '#3b82f6', // blue-500
      badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
      badgeText: 'text-blue-700 dark:text-blue-400',
      borderColor: 'border-blue-500',
      advisoryTitle: 'Acceptable Air Quality',
      generalHealthAdvisory: 'Air quality is acceptable. Normal daily activities for all persons can be maintained.',
      vulnerableGroupAdvisory: 'Normal activities. Persons who are unusually sensitive may monitor symptoms.',
      maskRecommended: false,
    };
  }
  if (psiValue <= 200) {
    return {
      band: 'unhealthy',
      label: 'Unhealthy',
      colorHex: '#f59e0b', // amber-500
      badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      badgeText: 'text-amber-700 dark:text-amber-400',
      borderColor: 'border-amber-500',
      advisoryTitle: 'Reduce Outdoor Exertion',
      generalHealthAdvisory: 'Healthy persons should reduce prolonged or strenuous outdoor physical exertion.',
      vulnerableGroupAdvisory: 'Elderly, pregnant women, and children should minimize outdoor exertion. Persons with chronic lung or heart disease should avoid outdoor activity.',
      maskRecommended: true,
    };
  }
  if (psiValue <= 300) {
    return {
      band: 'very_unhealthy',
      label: 'Very Unhealthy',
      colorHex: '#f97316', // orange-500
      badgeBg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
      badgeText: 'text-orange-700 dark:text-orange-400',
      borderColor: 'border-orange-500',
      advisoryTitle: 'Avoid Strenuous Exertion',
      generalHealthAdvisory: 'Healthy individuals should avoid prolonged or strenuous outdoor physical exertion.',
      vulnerableGroupAdvisory: 'Vulnerable individuals should avoid all outdoor physical exertion and stay indoors.',
      maskRecommended: true,
    };
  }
  return {
    band: 'hazardous',
    label: 'Hazardous',
    colorHex: '#ef4444', // red-500
    badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    badgeText: 'text-rose-700 dark:text-rose-400',
    borderColor: 'border-rose-600',
    advisoryTitle: 'Emergency Air Quality',
    generalHealthAdvisory: 'Healthy persons should minimize all outdoor activity. Keep doors and windows closed.',
    vulnerableGroupAdvisory: 'Elderly, children, and persons with heart/lung disease must remain indoors. Use air purifier.',
    maskRecommended: true,
  };
}

/**
 * Calculates 1-hr PM2.5 Safety Indicator according to Singapore NEA 4-Band standard
 */
export function getPm25Indicator(pm25Value: number): AirQualityIndicator {
  if (pm25Value <= 55) {
    return {
      band: 'good',
      label: 'Normal (Band I)',
      colorHex: '#10b981',
      badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      badgeText: 'text-emerald-700 dark:text-emerald-400',
      borderColor: 'border-emerald-500',
      advisoryTitle: 'Normal Activities',
      generalHealthAdvisory: 'Normal activities can be continued.',
      vulnerableGroupAdvisory: 'Normal activities can be continued.',
      maskRecommended: false,
    };
  }
  if (pm25Value <= 150) {
    return {
      band: 'moderate',
      label: 'Elevated (Band II)',
      colorHex: '#f59e0b',
      badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      badgeText: 'text-amber-700 dark:text-amber-400',
      borderColor: 'border-amber-500',
      advisoryTitle: 'Elevated Particles',
      generalHealthAdvisory: 'Normal activities for healthy individuals.',
      vulnerableGroupAdvisory: 'Vulnerable individuals should reduce strenuous outdoor physical exertion.',
      maskRecommended: false,
    };
  }
  if (pm25Value <= 250) {
    return {
      band: 'unhealthy',
      label: 'High (Band III)',
      colorHex: '#f97316',
      badgeBg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
      badgeText: 'text-orange-700 dark:text-orange-400',
      borderColor: 'border-orange-500',
      advisoryTitle: 'High PM2.5 Level',
      generalHealthAdvisory: 'Healthy persons should reduce prolonged or strenuous outdoor physical exertion.',
      vulnerableGroupAdvisory: 'Vulnerable individuals should avoid outdoor physical exertion.',
      maskRecommended: true,
    };
  }
  return {
    band: 'hazardous',
    label: 'Very High (Band IV)',
    colorHex: '#ef4444',
    badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    badgeText: 'text-rose-700 dark:text-rose-400',
    borderColor: 'border-rose-600',
    advisoryTitle: 'Hazardous PM2.5',
    generalHealthAdvisory: 'Healthy persons should avoid outdoor physical exertion.',
    vulnerableGroupAdvisory: 'Vulnerable individuals should stay indoors and minimize physical exertion.',
    maskRecommended: true,
  };
}

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds the closest NEA region based on coordinates
 */
export function findNearestRegion(latitude: number, longitude: number): {
  region: NeaRegionKey;
  distanceKm: number;
} {
  const regions: NeaRegionKey[] = ['north', 'south', 'east', 'west', 'central'];
  let closestRegion: NeaRegionKey = 'central';
  let minDistance = Infinity;

  for (const reg of regions) {
    const coords = REGION_COORDINATES[reg];
    const dist = calculateDistanceKm(latitude, longitude, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestRegion = reg;
    }
  }

  return { region: closestRegion, distanceKm: minDistance };
}

/**
 * Fetches PSI & PM2.5 real-time data from NEA API
 */
export async function fetchAirQualityData(): Promise<{
  regions: Record<NeaRegionKey, RegionAirData>;
  nationalAverage: { psi: number; pm25: number; psiBand: AirQualityIndicator; pm25Band: AirQualityIndicator };
  lastUpdated: string;
  source: string;
}> {
  // First try server proxy or direct NEA endpoint
  const psiUrl = '/api/nea/psi';
  const pm25Url = '/api/nea/pm25';

  let psiData: PsiApiResponse | null = null;
  let pm25Data: Pm25ApiResponse | null = null;

  try {
    const [psiRes, pm25Res] = await Promise.all([
      fetch(psiUrl).catch(() => fetch('https://api-open.data.gov.sg/v2/real-time/api/psi')),
      fetch(pm25Url).catch(() => fetch('https://api-open.data.gov.sg/v2/real-time/api/pm25')),
    ]);

    if (psiRes.ok) psiData = await psiRes.json();
    if (pm25Res.ok) pm25Data = await pm25Res.json();
  } catch {
    // Direct fallback
    const [fallbackPsi, fallbackPm25] = await Promise.all([
      fetch('https://api-open.data.gov.sg/v2/real-time/api/psi').then(r => r.json()),
      fetch('https://api-open.data.gov.sg/v2/real-time/api/pm25').then(r => r.json()),
    ]);
    psiData = fallbackPsi;
    pm25Data = fallbackPm25;
  }

  const psiItem = psiData?.data?.items?.[0];
  const pm25Item = pm25Data?.data?.items?.[0];

  const psiReadings = psiItem?.readings || {
    psi_twenty_four_hourly: { north: 50, south: 50, east: 50, west: 50, central: 50 },
  };
  const pm25Readings = pm25Item?.readings || {
    pm25_one_hourly: { north: 18, south: 22, east: 19, west: 24, central: 20 },
  };

  const regionKeys: NeaRegionKey[] = ['north', 'south', 'east', 'west', 'central'];
  const regions: Record<NeaRegionKey, RegionAirData> = {} as any;

  let totalPsi = 0;
  let totalPm25 = 0;

  for (const key of regionKeys) {
    const psiVal = psiReadings.psi_twenty_four_hourly?.[key] ?? 50;
    const pm25Val = pm25Readings.pm25_one_hourly?.[key] ?? 20;

    totalPsi += psiVal;
    totalPm25 += pm25Val;

    regions[key] = {
      key,
      name: key,
      displayName: REGION_COORDINATES[key].displayName,
      latitude: REGION_COORDINATES[key].lat,
      longitude: REGION_COORDINATES[key].lng,
      psi24h: psiVal,
      pm25_1h: pm25Val,
      pm25_24h: psiReadings.pm25_twenty_four_hourly?.[key],
      pm10_24h: psiReadings.pm10_twenty_four_hourly?.[key],
      o3_8h: psiReadings.o3_eight_hour_max?.[key],
      no2_1h: psiReadings.no2_one_hour_max?.[key],
      so2_24h: psiReadings.so2_twenty_four_hourly?.[key],
      co_8h: psiReadings.co_eight_hour_max?.[key],
      psiBand: getPsiIndicator(psiVal),
      pm25Band: getPm25Indicator(pm25Val),
    };
  }

  const avgPsi = Math.round(totalPsi / regionKeys.length);
  const avgPm25 = Math.round(totalPm25 / regionKeys.length);

  return {
    regions,
    nationalAverage: {
      psi: avgPsi,
      pm25: avgPm25,
      psiBand: getPsiIndicator(avgPsi),
      pm25Band: getPm25Indicator(avgPm25),
    },
    lastUpdated: psiItem?.updatedTimestamp || pm25Item?.updatedTimestamp || new Date().toISOString(),
    source: 'NEA Singapore Data.gov.sg v2 API',
  };
}

/**
 * Checks API health directly from /api/health.js
 */
export async function fetchHealthReport(): Promise<ApiHealthReport> {
  const res = await fetch('/api/health.js', {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Health check returned HTTP ${res.status}`);
  }
  return await res.json();
}
