import React from 'react';
import {
  Wind,
  Activity,
  Server,
  RefreshCw,
  Navigation,
  Clock,
  Layers,
} from 'lucide-react';
import { AirQualityIndicator } from '../types/nea';

interface NavbarProps {
  metricMode: 'psi' | 'pm25';
  onMetricModeChange: (mode: 'psi' | 'pm25') => void;
  nationalAverage: {
    psi: number;
    pm25: number;
    psiBand: AirQualityIndicator;
    pm25Band: AirQualityIndicator;
  };
  lastUpdated: string;
  onRefresh: () => void;
  refreshing: boolean;
  onOpenHealthModal: () => void;
  onLocateMe: () => void;
  locating: boolean;
  apiHealthy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  metricMode,
  onMetricModeChange,
  nationalAverage,
  lastUpdated,
  onRefresh,
  refreshing,
  onOpenHealthModal,
  onLocateMe,
  locating,
  apiHealthy,
}) => {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Live';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo and National Summary */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
            <Wind className="w-5 h-5 text-slate-950" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                SG Air Quality &amp; Haze Monitor
              </h1>
              <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 uppercase tracking-wider">
                NEA Real-time
              </span>
            </div>

            {/* Sub-header with National Reading */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>National Avg:</span>
              <span className="font-mono font-bold text-white">
                {metricMode === 'psi' ? `${nationalAverage.psi} PSI` : `${nationalAverage.pm25} μg/m³`}
              </span>
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    metricMode === 'psi'
                      ? nationalAverage.psiBand.colorHex
                      : nationalAverage.pm25Band.colorHex,
                }}
              />
              <span className="hidden sm:inline">
                ({metricMode === 'psi' ? nationalAverage.psiBand.label : nationalAverage.pm25Band.label})
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Metric Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => onMetricModeChange('pm25')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                metricMode === 'pm25'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>1-hr PM2.5</span>
            </button>

            <button
              onClick={() => onMetricModeChange('psi')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                metricMode === 'psi'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>24-hr PSI</span>
            </button>
          </div>

          {/* API Health Monitor Button */}
          <button
            onClick={onOpenHealthModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition-colors"
            title="Inspect NEA API Health & Status (/api/health.js)"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  apiHealthy ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  apiHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>
            <span className="hidden md:inline font-mono text-[11px]">API Health</span>
          </button>

          {/* Locate GPS Button */}
          <button
            onClick={onLocateMe}
            disabled={locating}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 text-xs font-medium transition-colors flex items-center gap-1"
            title="Locate nearest station"
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline text-slate-300">GPS</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title={`Last updated at ${formattedTime}. Click to refresh.`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
