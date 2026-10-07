import React from 'react';
import { RegionAirData, UserLocation } from '../types/nea';
import {
  ShieldAlert,
  ShieldCheck,
  HeartPulse,
  Users,
  Activity,
  AlertTriangle,
  Flame,
  Wind,
  Navigation,
  CheckCircle2,
} from 'lucide-react';

interface AirQualityCardProps {
  regionData: RegionAirData;
  userLocation: UserLocation | null;
  metricMode: 'psi' | 'pm25';
  onToggleMetricMode: () => void;
  onLocateMe: () => void;
  locating: boolean;
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({
  regionData,
  userLocation,
  metricMode,
  onToggleMetricMode,
  onLocateMe,
  locating,
}) => {
  const isNearestToUser = userLocation?.nearestRegion === regionData.key;
  const currentIndicator = metricMode === 'psi' ? regionData.psiBand : regionData.pm25Band;

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {regionData.displayName} Region Air Quality
            </h3>
            {isNearestToUser && (
              <span className="px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-700/60 text-sky-300 text-xs font-semibold flex items-center gap-1">
                <Navigation className="w-3 h-3 text-sky-400" />
                Nearest Station
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Station GPS: {regionData.latitude.toFixed(4)}°N, {regionData.longitude.toFixed(4)}°E
            {isNearestToUser && userLocation && ` · ${userLocation.distanceKm} km from your position`}
          </p>
        </div>

        {/* Quick GPS button */}
        <button
          onClick={onLocateMe}
          disabled={locating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
          title="Detect nearest monitoring station using GPS"
        >
          <Navigation className={`w-3.5 h-3.5 text-sky-400 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Locating...' : 'Locate Me'}</span>
        </button>
      </div>

      {/* Main Readings Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary 1-Hr PM2.5 Box */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            metricMode === 'pm25'
              ? 'ring-2 ring-sky-500/80 border-sky-500/40 bg-slate-800/70'
              : 'border-slate-800 bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer'
          }`}
          onClick={metricMode !== 'pm25' ? onToggleMetricMode : undefined}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-sky-400" />
              1-Hour PM2.5 (Primary Indicator)
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${regionData.pm25Band.badgeBg}`}
            >
              {regionData.pm25Band.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight"
              style={{ color: regionData.pm25Band.colorHex }}
            >
              {regionData.pm25_1h}
            </span>
            <span className="text-sm font-semibold text-slate-400">μg/m³</span>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Fine particulate matter (diameter &le; 2.5 micrometers). Best indicator for real-time immediate outdoor activities.
          </p>
        </div>

        {/* 24-Hr PSI Box */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            metricMode === 'psi'
              ? 'ring-2 ring-sky-500/80 border-sky-500/40 bg-slate-800/70'
              : 'border-slate-800 bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer'
          }`}
          onClick={metricMode !== 'psi' ? onToggleMetricMode : undefined}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              24-Hour Pollutant Standards Index (PSI)
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${regionData.psiBand.badgeBg}`}
            >
              {regionData.psiBand.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight"
              style={{ color: regionData.psiBand.colorHex }}
            >
              {regionData.psi24h}
            </span>
            <span className="text-sm font-semibold text-slate-400">PSI</span>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Composite index of 6 criteria pollutants (PM2.5, PM10, SO2, NO2, O3, CO) averaged over 24 hours.
          </p>
        </div>
      </div>

      {/* Official NEA Health Advisory Section */}
      <div className="px-5 pb-5">
        <div
          className="p-4 rounded-xl border transition-all"
          style={{
            borderColor: `${currentIndicator.colorHex}55`,
            backgroundColor: `${currentIndicator.colorHex}12`,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="p-2 rounded-lg shrink-0"
              style={{ backgroundColor: `${currentIndicator.colorHex}25` }}
            >
              {currentIndicator.band === 'good' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : currentIndicator.band === 'moderate' ? (
                <Activity className="w-5 h-5 text-blue-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              )}
            </div>

            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Official Health Advisory:</span>
                  <span style={{ color: currentIndicator.colorHex }}>
                    {currentIndicator.advisoryTitle}
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Based on current air quality recommendations by the Singapore Ministry of Health (MOH) and NEA.
                </p>
              </div>

              {/* General vs Vulnerable Groups */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-1">
                    <Users className="w-4 h-4 text-sky-400" />
                    Healthy Individuals
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentIndicator.generalHealthAdvisory}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-1">
                    <HeartPulse className="w-4 h-4 text-amber-400" />
                    Elderly, Children, Pregnant & Chronic Heart/Lung
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentIndicator.vulnerableGroupAdvisory}
                  </p>
                </div>
              </div>

              {/* Mask Alert if needed */}
              {currentIndicator.maskRecommended && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-200 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>N95 Mask Advisory:</strong> Recommended for prolonged outdoor physical activity or vulnerable persons stepping outside.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Pollutants Breakdown */}
      <div className="px-5 pb-5 border-t border-slate-800/80 pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          Secondary Pollutants Breakdown (NEA Regional Telemetry)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">PM10 (24-hr)</span>
            <span className="text-base font-bold font-mono text-white mt-0.5 block">
              {regionData.pm10_24h ?? '—'} <span className="text-[10px] text-slate-400 font-normal">μg/m³</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Ozone O₃ (8-hr max)</span>
            <span className="text-base font-bold font-mono text-white mt-0.5 block">
              {regionData.o3_8h ?? '—'} <span className="text-[10px] text-slate-400 font-normal">μg/m³</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Nitrogen NO₂ (1-hr)</span>
            <span className="text-base font-bold font-mono text-white mt-0.5 block">
              {regionData.no2_1h ?? '—'} <span className="text-[10px] text-slate-400 font-normal">μg/m³</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Sulphur SO₂ (24-hr)</span>
            <span className="text-base font-bold font-mono text-white mt-0.5 block">
              {regionData.so2_24h ?? '—'} <span className="text-[10px] text-slate-400 font-normal">μg/m³</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Carbon CO (8-hr)</span>
            <span className="text-base font-bold font-mono text-white mt-0.5 block">
              {regionData.co_8h ?? '—'} <span className="text-[10px] text-slate-400 font-normal">mg/m³</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
