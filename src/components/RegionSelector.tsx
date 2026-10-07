import React, { useState } from 'react';
import { NeaRegionKey, RegionAirData, UserLocation } from '../types/nea';
import { SINGAPORE_TOWNS } from '../services/neaService';
import { Search, MapPin, Navigation, ChevronRight } from 'lucide-react';

interface RegionSelectorProps {
  regions: Record<NeaRegionKey, RegionAirData>;
  selectedRegion: NeaRegionKey;
  onSelectRegion: (region: NeaRegionKey) => void;
  metricMode: 'psi' | 'pm25';
  userLocation: UserLocation | null;
  onTownSelect: (townName: string, region: NeaRegionKey, lat: number, lng: number) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  metricMode,
  userLocation,
  onTownSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const regionKeys: NeaRegionKey[] = ['north', 'south', 'east', 'west', 'central'];

  const filteredTowns = searchQuery.trim()
    ? SINGAPORE_TOWNS.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.region.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="w-full space-y-3">
      {/* Search Bar for Neighborhoods */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search your Singapore town (e.g., Woodlands, Jurong, Bedok, Orchard, Tampines)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/80 backdrop-blur-md shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {isSearchOpen && filteredTowns.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-30 max-h-56 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1 text-xs">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Matching Neighborhoods & Stations
            </div>
            {filteredTowns.map((town) => {
              const regData = regions[town.region];
              const indicator = metricMode === 'psi' ? regData.psiBand : regData.pm25Band;
              const val = metricMode === 'psi' ? regData.psi24h : regData.pm25_1h;
              const unit = metricMode === 'psi' ? 'PSI' : 'μg/m³';

              return (
                <button
                  key={town.name}
                  onClick={() => {
                    onTownSelect(town.name, town.region, town.lat, town.lng);
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-white group-hover:text-sky-300">
                        {town.name}
                      </span>
                      <span className="text-slate-400 text-[11px] ml-1.5 capitalize">
                        ({town.region} Region)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                      style={{
                        backgroundColor: `${indicator.colorHex}25`,
                        color: indicator.colorHex,
                      }}
                    >
                      {val} {unit}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Region Tabs (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {regionKeys.map((key) => {
          const data = regions[key];
          const isSelected = selectedRegion === key;
          const isNearest = userLocation?.nearestRegion === key;
          const indicator = metricMode === 'psi' ? data.psiBand : data.pm25Band;
          const val = metricMode === 'psi' ? data.psi24h : data.pm25_1h;
          const unit = metricMode === 'psi' ? 'PSI' : 'μg/m³';

          return (
            <button
              key={key}
              onClick={() => onSelectRegion(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all shrink-0 ${
                isSelected
                  ? 'bg-slate-800 text-white border-sky-500/80 shadow-md ring-1 ring-sky-500/50'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: indicator.colorHex }}
              />

              <div className="flex flex-col text-left">
                <span className="font-bold flex items-center gap-1">
                  {data.displayName}
                  {isNearest && (
                    <span className="text-[10px] text-sky-400 font-normal">
                      (Near you)
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {val} {unit}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
