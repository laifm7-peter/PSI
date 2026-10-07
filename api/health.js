/**
 * API Health Monitor for Singapore NEA Real-time Air Quality APIs
 * Endpoints monitored:
 * - PSI: https://api-open.data.gov.sg/v2/real-time/api/psi
 * - PM2.5: https://api-open.data.gov.sg/v2/real-time/api/pm25
 */

const PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const PM25_URL = 'https://api-open.data.gov.sg/v2/real-time/api/pm25';

/**
 * Pings an individual NEA endpoint and measures metrics.
 * @param {string} url
 * @param {string} name
 */
export async function pingEndpoint(url, name) {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SGAirQualityMonitor/1.0',
      },
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    const isHttpOk = res.status >= 200 && res.status < 300;

    if (!isHttpOk) {
      return {
        name,
        url,
        status: 'error',
        httpStatus: res.status,
        statusText: res.statusText,
        latencyMs,
        healthy: false,
        lastUpdated: null,
        error: `HTTP error ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    const isApiOk = Boolean(data && data.code === 0 && data.data);
    const latestItem = data?.data?.items?.[0];
    const regionCount = data?.data?.regionMetadata?.length || 0;

    return {
      name,
      url,
      status: isApiOk ? 'operational' : 'invalid_payload',
      httpStatus: res.status,
      latencyMs,
      healthy: isApiOk,
      code: data?.code,
      lastUpdated: latestItem?.updatedTimestamp || latestItem?.timestamp || null,
      date: latestItem?.date || null,
      regionCount,
      regions: data?.data?.regionMetadata?.map(r => r.name) || [],
      error: isApiOk ? null : (data?.errorMsg || 'Payload missing standard data structures'),
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      name,
      url,
      status: 'unreachable',
      httpStatus: 0,
      latencyMs,
      healthy: false,
      lastUpdated: null,
      error: err.name === 'AbortError' ? 'Request timed out after 8000ms' : (err.message || 'Network error'),
    };
  }
}

/**
 * Runs the full health check suite against all required NEA APIs.
 */
export async function getHealthStatus() {
  const startedAt = new Date().toISOString();
  const [psiResult, pm25Result] = await Promise.all([
    pingEndpoint(PSI_URL, 'PSI (24-Hour & Pollutants)'),
    pingEndpoint(PM25_URL, 'PM2.5 (1-Hour Regional)'),
  ]);

  const allHealthy = psiResult.healthy && pm25Result.healthy;
  const anyHealthy = psiResult.healthy || pm25Result.healthy;

  let overallStatus = 'operational';
  if (!anyHealthy) {
    overallStatus = 'major_outage';
  } else if (!allHealthy || psiResult.latencyMs > 2500 || pm25Result.latencyMs > 2500) {
    overallStatus = 'degraded';
  }

  return {
    status: overallStatus,
    timestamp: startedAt,
    uptimeSec: typeof process !== 'undefined' && process.uptime ? Math.floor(process.uptime()) : null,
    environment: (typeof process !== 'undefined' && process.env?.NODE_ENV) || 'development',
    summary: {
      totalEndpoints: 2,
      healthyEndpoints: [psiResult, pm25Result].filter(r => r.healthy).length,
      averageLatencyMs: Math.round((psiResult.latencyMs + pm25Result.latencyMs) / 2),
    },
    services: {
      psi: psiResult,
      pm25: pm25Result,
    },
  };
}

/**
 * Express middleware handler
 */
export default async function healthHandler(req, res) {
  try {
    const health = await getHealthStatus();
    const httpStatusCode = health.status === 'major_outage' ? 503 : 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(httpStatusCode).json(health);
  } catch (err) {
    res.status(500).json({
      status: 'internal_error',
      timestamp: new Date().toISOString(),
      error: err.message || 'Failed to check API health',
    });
  }
}
