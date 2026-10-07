import React from 'react';
import { NeaRegionKey, RegionAirData, UserLocation } from '../types/nea';
import { MapPin, Navigation, Info } from 'lucide-react';

interface SingaporeMapProps {
  regions: Record<NeaRegionKey, RegionAirData>;
  selectedRegion: NeaRegionKey;
  onSelectRegion: (region: NeaRegionKey) => void;
  metricMode: 'psi' | 'pm25';
  userLocation: UserLocation | null;
}

// Singapore coordinate bounds for SVG projection
// Longitude: ~103.60 to ~104.04 (approx 0.44 deg span)
// Latitude: ~1.20 to ~1.48 (approx 0.28 deg span)
const SVG_WIDTH = 900;
const SVG_HEIGHT = 520;

function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const minLng = 103.60;
  const maxLng = 104.04;
  const minLat = 1.22;
  const maxLat = 1.48;

  const x = ((lng - minLng) / (maxLng - minLng)) * (SVG_WIDTH - 120) + 60;
  // Invert latitude for SVG y-axis
  const y = SVG_HEIGHT - (((lat - minLat) / (maxLat - minLat)) * (SVG_HEIGHT - 100) + 50);

  return { x: Math.round(x), y: Math.round(y) };
}

// Region polygon boundaries calibrated for Singapore map geometry
const REGION_BOUNDARIES: Record<NeaRegionKey, string> = {
  // North Region (Woodlands, Sembawang, Yishun, Mandai)
  north: 'M 350 40 L 490 35 L 610 80 L 590 145 L 490 175 L 375 165 L 320 120 L 350 40 Z',
  // West Region (Tuas, Jurong, Bukit Batok, CCK, Clementi)
  west: 'M 70 280 L 170 210 L 320 120 L 375 165 L 360 260 L 290 330 L 160 380 L 70 280 Z',
  // Central Region (Bishan, Ang Mo Kio, Toa Payoh, Novena, Orchard)
  central: 'M 375 165 L 490 175 L 530 250 L 460 320 L 360 260 Z',
  // East Region (Tampines, Bedok, Pasir Ris, Changi)
  east: 'M 490 175 L 590 145 L 750 170 L 830 220 L 760 300 L 610 310 L 530 250 Z',
  // South Region (Marina, Bukit Merah, Sentosa, Pasir Panjang)
  south: 'M 290 330 L 360 260 L 460 320 L 530 250 L 610 310 L 580 370 L 470 410 L 340 380 Z',
};

// Offshore islands
const ISLANDS = [
  // Sentosa
  { id: 'sentosa', path: 'M 430 420 Q 470 415 500 435 Q 460 455 425 435 Z', name: 'Sentosa' },
  // Pulau Ubin
  { id: 'ubin', path: 'M 720 125 Q 770 120 790 140 Q 750 155 715 140 Z', name: 'Pulau Ubin' },
  // Pulau Tekong
  { id: 'tekong', path: 'M 820 110 Q 865 110 875 145 Q 830 160 815 130 Z', name: 'Pulau Tekong' },
  // Jurong Island
  { id: 'jurong_island', path: 'M 190 395 Q 260 380 280 430 Q 210 460 180 425 Z', name: 'Jurong Island' },
];

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  metricMode,
  userLocation,
}) => {
  // Station marker coordinates
  const stationSvgPoints: Record<NeaRegionKey, { x: number; y: number }> = {
    north: geoToSvg(1.41803, 103.82000),
    south: geoToSvg(1.29587, 103.82000),
    east: geoToSvg(1.35735, 103.94000),
    west: geoToSvg(1.35735, 103.70000),
    central: geoToSvg(1.35735, 103.82000),
  };

  const userSvgPoint = userLocation ? geoToSvg(userLocation.latitude, userLocation.longitude) : null;

  return (
    <div className="relative w-full rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Map Header Overlay */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Singapore Air Monitoring Stations
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tap any region or sensor pin to inspect detailed pollutant levels and safety advice
          </p>
        </div>

        {/* Legend Pills for active metric */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          {metricMode === 'psi' ? (
            <>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> 0-50 Good
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> 51-100 Mod
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 101-200 Unhealthy
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-orange-400">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> 201-300 V.Unhealthy
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;300 Haz
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> 0-55 Normal
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 56-150 Elevated
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-orange-400">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> 151-250 High
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;250 V.High
              </span>
            </>
          )}
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/10] max-h-[560px] flex items-center justify-center p-2 sm:p-4 select-none">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full drop-shadow-2xl transition-all"
        >
          {/* Subtle grid pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
            {/* Filter glow for active pins */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Surrounding Straits Water styling */}
          <path
            d="M 20 20 L 880 20 L 880 500 L 20 500 Z"
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeDasharray="4 8"
          />

          {/* Territorial water labels */}
          <text x="450" y="25" fill="#475569" fontSize="12" textAnchor="middle" letterSpacing="3">
            JOHOR STRAITS (MALAYSIA)
          </text>
          <text x="450" y="495" fill="#475569" fontSize="12" textAnchor="middle" letterSpacing="3">
            SINGAPORE STRAITS
          </text>

          {/* Offshore Islands */}
          {ISLANDS.map((island) => (
            <g key={island.id}>
              <path
                d={island.path}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
                className="opacity-70 hover:opacity-100 transition-opacity"
              />
              <text
                x={island.id === 'sentosa' ? 465 : island.id === 'ubin' ? 750 : island.id === 'tekong' ? 845 : 230}
                y={island.id === 'sentosa' ? 440 : island.id === 'ubin' ? 140 : island.id === 'tekong' ? 140 : 425}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
                className="pointer-events-none"
              >
                {island.name}
              </text>
            </g>
          ))}

          {/* Regional Land Polygons */}
          {(['north', 'west', 'central', 'east', 'south'] as NeaRegionKey[]).map((key) => {
            const data = regions[key];
            const indicator = metricMode === 'psi' ? data.psiBand : data.pm25Band;
            const isSelected = selectedRegion === key;
            const isNearestToUser = userLocation?.nearestRegion === key;

            return (
              <g
                key={key}
                onClick={() => onSelectRegion(key)}
                className="cursor-pointer group focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={`Region ${data.displayName}: ${metricMode.toUpperCase()} is ${metricMode === 'psi' ? data.psi24h : data.pm25_1h}, status ${indicator.label}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectRegion(key);
                  }
                }}
              >
                {/* Region boundary polygon */}
                <path
                  d={REGION_BOUNDARIES[key]}
                  fill={indicator.colorHex}
                  fillOpacity={isSelected ? 0.32 : 0.16}
                  stroke={isSelected ? '#ffffff' : indicator.colorHex}
                  strokeWidth={isSelected ? 3.5 : 1.8}
                  strokeDasharray={isNearestToUser ? '6 4' : undefined}
                  className="transition-all duration-300 group-hover:fill-opacity-28 group-hover:stroke-width-3"
                />

                {/* Region Name Label */}
                <text
                  x={stationSvgPoints[key].x}
                  y={stationSvgPoints[key].y - 38}
                  fill="#f8fafc"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow"
                >
                  {data.displayName}
                </text>
              </g>
            );
          })}

          {/* Connecting line from user GPS to nearest region */}
          {userSvgPoint && userLocation && (
            <line
              x1={userSvgPoint.x}
              y1={userSvgPoint.y}
              x2={stationSvgPoints[userLocation.nearestRegion].x}
              y2={stationSvgPoints[userLocation.nearestRegion].y}
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.8"
            />
          )}

          {/* Station Sensor Pins with real-time numeric badges */}
          {(['north', 'west', 'central', 'east', 'south'] as NeaRegionKey[]).map((key) => {
            const data = regions[key];
            const pt = stationSvgPoints[key];
            const indicator = metricMode === 'psi' ? data.psiBand : data.pm25Band;
            const isSelected = selectedRegion === key;
            const value = metricMode === 'psi' ? data.psi24h : data.pm25_1h;
            const unit = metricMode === 'psi' ? 'PSI' : 'μg/m³';

            return (
              <g
                key={`pin-${key}`}
                transform={`translate(${pt.x}, ${pt.y})`}
                onClick={() => onSelectRegion(key)}
                className="cursor-pointer group"
              >
                {/* Outer animated radar pulse ring when selected */}
                {isSelected && (
                  <circle
                    r="28"
                    fill="none"
                    stroke={indicator.colorHex}
                    strokeWidth="2"
                    opacity="0.8"
                    className="animate-ping"
                  />
                )}

                {/* Station Pin Base Glow */}
                <circle
                  r="22"
                  fill="#0f172a"
                  stroke={isSelected ? '#ffffff' : indicator.colorHex}
                  strokeWidth={isSelected ? 3 : 2}
                  filter="url(#glow)"
                  className="group-hover:scale-110 transition-transform origin-center"
                />

                {/* Sensor Value */}
                <text
                  y="2"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="800"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="pointer-events-none select-none"
                >
                  {value}
                </text>

                {/* Sensor Unit Pill below */}
                <g transform="translate(0, 24)">
                  <rect
                    x="-26"
                    y="0"
                    width="52"
                    height="16"
                    rx="8"
                    fill={indicator.colorHex}
                    opacity="0.9"
                  />
                  <text
                    x="0"
                    y="11"
                    fill="#0f172a"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none uppercase"
                  >
                    {unit}
                  </text>
                </g>
              </g>
            );
          })}

          {/* User GPS Pin (if located) */}
          {userSvgPoint && userLocation && (
            <g transform={`translate(${userSvgPoint.x}, ${userSvgPoint.y})`}>
              {/* Radar pulse */}
              <circle
                r="18"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                className="animate-ping"
                opacity="0.75"
              />
              <circle
                r="12"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="url(#glow)"
              />
              <circle r="4" fill="#ffffff" />
              {/* Tooltip callout */}
              <g transform="translate(0, -22)">
                <rect
                  x="-55"
                  y="-16"
                  width="110"
                  height="18"
                  rx="4"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-4"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Your Location
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Selected Region Quick Badge at Map Bottom */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto max-w-sm bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 backdrop-blur-md shadow-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{
                backgroundColor:
                  metricMode === 'psi'
                    ? regions[selectedRegion].psiBand.colorHex
                    : regions[selectedRegion].pm25Band.colorHex,
              }}
            />
            <div className="truncate">
              <span className="font-bold text-white text-sm">
                {regions[selectedRegion].displayName} Singapore
              </span>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {metricMode === 'psi' ? (
                  <>
                    24-hr PSI: <strong className="text-white font-mono">{regions[selectedRegion].psi24h}</strong> ({regions[selectedRegion].psiBand.label})
                  </>
                ) : (
                  <>
                    1-hr PM2.5: <strong className="text-white font-mono">{regions[selectedRegion].pm25_1h} μg/m³</strong> ({regions[selectedRegion].pm25Band.label})
                  </>
                )}
              </div>
            </div>
          </div>

          {userLocation?.nearestRegion === selectedRegion && (
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-semibold shrink-0">
              Nearest to you ({userLocation.distanceKm} km)
            </span>
          )}
        </div>
      </div>

      {/* Map Footer helper note */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          Data sourced real-time from NEA Government Open Data API.
        </span>
        <span className="font-mono text-slate-400 hidden sm:inline">
          Official Singapore EPSG Geodetic Projection
        </span>
      </div>
    </div>
  );
};
