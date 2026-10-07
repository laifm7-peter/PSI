import React, { useState, useEffect, useCallback } from 'react';
import {
  NeaRegionKey,
  RegionAirData,
  UserLocation,
  AirQualityIndicator,
} from './types/nea';
import {
  fetchAirQualityData,
  findNearestRegion,
  fetchHealthReport,
} from './services/neaService';
import { HazeAtmosphere } from './components/HazeAtmosphere';
import { Navbar } from './components/Navbar';
import { SingaporeMap } from './components/SingaporeMap';
import { AirQualityCard } from './components/AirQualityCard';
import { RegionSelector } from './components/RegionSelector';
import { HealthGuidelines } from './components/HealthGuidelines';
import { ApiHealthModal } from './components/ApiHealthModal';
import {
  AlertTriangle,
  Loader2,
  Navigation,
  RefreshCw,
  Info,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [regions, setRegions] = useState<Record<NeaRegionKey, RegionAirData> | null>(null);
  const [nationalAverage, setNationalAverage] = useState<{
    psi: number;
    pm25: number;
    psiBand: AirQualityIndicator;
    pm25Band: AirQualityIndicator;
  } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<NeaRegionKey>('central');
  const [metricMode, setMetricMode] = useState<'pm25' | 'psi'>('pm25');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  // Weather Haze Effect State
  const [simulatedPsi, setSimulatedPsi] = useState<number | null>(null);
  const [hazeEffectEnabled, setHazeEffectEnabled] = useState<boolean>(true);

  // Health Modal State
  const [healthModalOpen, setHealthModalOpen] = useState<boolean>(false);
  const [apiHealthy, setApiHealthy] = useState<boolean>(true);

  // Load air quality data
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchAirQualityData();
      setRegions(data.regions);
      setNationalAverage(data.nationalAverage);
      setLastUpdated(data.lastUpdated);

      // Verify health check in background
      fetchHealthReport()
        .then((r) => setApiHealthy(r.status === 'operational'))
        .catch(() => setApiHealthy(false));
    } catch (err: any) {
      console.error('Failed to load air quality data:', err);
      setError(err.message || 'Unable to fetch real-time NEA air quality data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      loadData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadData]);

  // Request browser geolocation to find user's nearest NEA station
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationToast('Geolocation is not supported by your browser.');
      setTimeout(() => setLocationToast(null), 3500);
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const nearest = findNearestRegion(latitude, longitude);

        setUserLocation({
          latitude,
          longitude,
          accuracyMeters: accuracy,
          nearestRegion: nearest.region,
          distanceKm: nearest.distanceKm,
          source: 'gps',
        });
        setSelectedRegion(nearest.region);
        setLocating(false);
        setLocationToast(
          `Located! Nearest station is ${nearest.region.toUpperCase()} (${nearest.distanceKm} km away)`
        );
        setTimeout(() => setLocationToast(null), 4000);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocating(false);
        setLocationToast('Location access denied. You can select your town from the search box below.');
        setTimeout(() => setLocationToast(null), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Attempt auto-locate on initial mount if permission already granted
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((res) => {
        if (res.state === 'granted') {
          handleLocateMe();
        }
      });
    }
  }, [handleLocateMe]);

  // Handle town search selection
  const handleTownSelect = (townName: string, region: NeaRegionKey, lat: number, lng: number) => {
    const nearest = findNearestRegion(lat, lng);
    setUserLocation({
      latitude: lat,
      longitude: lng,
      nearestRegion: region,
      distanceKm: nearest.distanceKm,
      source: 'manual',
      locationName: townName,
    });
    setSelectedRegion(region);
    setLocationToast(`Centered on ${townName} (${region.toUpperCase()} Station)`);
    setTimeout(() => setLocationToast(null), 3500);
  };

  // Determine current effective PSI & PM2.5 for the background haze engine
  const activeRegionData = regions ? regions[selectedRegion] : null;
  const currentPsiForHaze =
    simulatedPsi !== null
      ? simulatedPsi
      : activeRegionData
      ? activeRegionData.psi24h
      : nationalAverage?.psi || 50;
  const currentPm25ForHaze = activeRegionData ? activeRegionData.pm25_1h : nationalAverage?.pm25 || 20;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950 relative">
      {/* Dynamic Background Haze Weather Engine */}
      <HazeAtmosphere
        psiValue={currentPsiForHaze}
        pm25Value={currentPm25ForHaze}
        simulatedPsi={simulatedPsi}
        onSimulatePsiChange={setSimulatedPsi}
        enabled={hazeEffectEnabled}
        onToggleEnabled={() => setHazeEffectEnabled(!hazeEffectEnabled)}
      />

      {/* Top Navigation */}
      <Navbar
        metricMode={metricMode}
        onMetricModeChange={setMetricMode}
        nationalAverage={
          nationalAverage || {
            psi: 50,
            pm25: 20,
            psiBand: {
              band: 'good',
              label: 'Good',
              colorHex: '#10b981',
              badgeBg: 'bg-emerald-50 text-emerald-700',
              badgeText: 'text-emerald-700',
              borderColor: 'border-emerald-500',
              advisoryTitle: 'Normal Activities',
              generalHealthAdvisory: 'Normal activities.',
              vulnerableGroupAdvisory: 'Normal activities.',
              maskRecommended: false,
            },
            pm25Band: {
              band: 'good',
              label: 'Normal',
              colorHex: '#10b981',
              badgeBg: 'bg-emerald-50 text-emerald-700',
              badgeText: 'text-emerald-700',
              borderColor: 'border-emerald-500',
              advisoryTitle: 'Normal Activities',
              generalHealthAdvisory: 'Normal activities.',
              vulnerableGroupAdvisory: 'Normal activities.',
              maskRecommended: false,
            },
          }
        }
        lastUpdated={lastUpdated}
        onRefresh={() => loadData(true)}
        refreshing={refreshing}
        onOpenHealthModal={() => setHealthModalOpen(true)}
        onLocateMe={handleLocateMe}
        locating={locating}
        apiHealthy={apiHealthy}
      />

      {/* Floating Toast Notification */}
      {locationToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-slate-900 border border-sky-500/80 text-white px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
          <Navigation className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{locationToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-6">
        {/* Loading State */}
        {loading && !regions && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
            <p className="text-sm font-medium text-slate-300">
              Retrieving live air quality readings from NEA Singapore...
            </p>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData(false)}
              className="px-3 py-1 rounded-lg bg-rose-900 hover:bg-rose-800 text-white font-medium text-xs transition-colors shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {regions && (
          <>
            {/* Quick Town Search & Region Selectors */}
            <RegionSelector
              regions={regions}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              metricMode={metricMode}
              userLocation={userLocation}
              onTownSelect={handleTownSelect}
            />

            {/* Grid Layout: Interactive Map + Active Region Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map Column */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-4">
                <SingaporeMap
                  regions={regions}
                  selectedRegion={selectedRegion}
                  onSelectRegion={setSelectedRegion}
                  metricMode={metricMode}
                  userLocation={userLocation}
                />
              </div>

              {/* Detail Card Column */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-4">
                <AirQualityCard
                  regionData={regions[selectedRegion]}
                  userLocation={userLocation}
                  metricMode={metricMode}
                  onToggleMetricMode={() =>
                    setMetricMode(metricMode === 'pm25' ? 'psi' : 'pm25')
                  }
                  onLocateMe={handleLocateMe}
                  locating={locating}
                />
              </div>
            </div>

            {/* Health Advisory Reference Guidelines */}
            <HealthGuidelines />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 py-6 px-4 mt-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Data powered by Singapore National Environment Agency (NEA)</span>
            <span>·</span>
            <span className="font-mono text-slate-400">Open Data API v2</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setHealthModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              API Status Checker
            </button>
            <a
              href="https://www.nea.gov.sg/our-services/pollution-control/air-pollution/faqs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              NEA Haze FAQ
            </a>
          </div>
        </div>
      </footer>

      {/* API Health Monitor Diagnostic Modal */}
      <ApiHealthModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
      />
    </div>
  );
}
