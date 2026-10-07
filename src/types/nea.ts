export type NeaRegionKey = 'north' | 'south' | 'east' | 'west' | 'central';

export interface RegionMetadata {
  name: NeaRegionKey;
  labelLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface PsiItemReadings {
  o3_sub_index?: Record<NeaRegionKey, number>;
  pm10_twenty_four_hourly?: Record<NeaRegionKey, number>;
  pm10_sub_index?: Record<NeaRegionKey, number>;
  co_sub_index?: Record<NeaRegionKey, number>;
  pm25_twenty_four_hourly?: Record<NeaRegionKey, number>;
  so2_sub_index?: Record<NeaRegionKey, number>;
  co_eight_hour_max?: Record<NeaRegionKey, number>;
  no2_one_hour_max?: Record<NeaRegionKey, number>;
  so2_twenty_four_hourly?: Record<NeaRegionKey, number>;
  pm25_sub_index?: Record<NeaRegionKey, number>;
  psi_twenty_four_hourly: Record<NeaRegionKey, number>;
  o3_eight_hour_max?: Record<NeaRegionKey, number>;
}

export interface PsiApiResponse {
  code: number;
  data: {
    regionMetadata: RegionMetadata[];
    items: Array<{
      date: string;
      updatedTimestamp: string;
      timestamp: string;
      readings: PsiItemReadings;
    }>;
  };
  errorMsg?: string;
}

export interface Pm25ItemReadings {
  pm25_one_hourly: Record<NeaRegionKey, number>;
}

export interface Pm25ApiResponse {
  code: number;
  data: {
    regionMetadata: RegionMetadata[];
    items: Array<{
      date: string;
      updatedTimestamp: string;
      timestamp: string;
      readings: Pm25ItemReadings;
    }>;
  };
  errorMsg?: string;
}

export interface ApiEndpointHealth {
  name: string;
  url: string;
  status: 'operational' | 'degraded' | 'error' | 'unreachable' | 'invalid_payload';
  httpStatus: number;
  latencyMs: number;
  healthy: boolean;
  code?: number;
  lastUpdated?: string | null;
  date?: string | null;
  regionCount?: number;
  regions?: string[];
  error?: string | null;
}

export interface ApiHealthReport {
  status: 'operational' | 'degraded' | 'major_outage';
  timestamp: string;
  uptimeSec?: number | null;
  environment: string;
  summary: {
    totalEndpoints: number;
    healthyEndpoints: number;
    averageLatencyMs: number;
  };
  services: {
    psi: ApiEndpointHealth;
    pm25: ApiEndpointHealth;
  };
}

export type AirQualityBand = 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface AirQualityIndicator {
  band: AirQualityBand;
  label: string;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  advisoryTitle: string;
  generalHealthAdvisory: string;
  vulnerableGroupAdvisory: string;
  maskRecommended: boolean;
}

export interface RegionAirData {
  key: NeaRegionKey;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  psi24h: number;
  pm25_1h: number;
  pm25_24h?: number;
  pm10_24h?: number;
  o3_8h?: number;
  no2_1h?: number;
  so2_24h?: number;
  co_8h?: number;
  psiBand: AirQualityIndicator;
  pm25Band: AirQualityIndicator;
  distanceKm?: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  nearestRegion: NeaRegionKey;
  distanceKm: number;
  source: 'gps' | 'manual';
  locationName?: string;
}
