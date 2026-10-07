import React from 'react';
import {
  ShieldAlert,
  Activity,
  Heart,
  Baby,
  Smile,
  AlertCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

export const HealthGuidelines: React.FC = () => {
  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md p-5 shadow-xl text-slate-300">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-sky-400" />
        <h3 className="text-base font-bold text-white">
          Singapore National Air Quality &amp; Haze Guidelines
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Guidance endorsed by the National Environment Agency (NEA) and the Ministry of Health (MOH) to help members of the public plan outdoor physical activities.
      </p>

      {/* Advisory Bands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Band 1 */}
        <div className="p-3.5 rounded-xl border border-emerald-900/50 bg-emerald-950/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-emerald-400">Normal / Good</span>
            <span className="font-mono text-[11px] text-emerald-300 font-semibold">
              PM2.5 &le; 55 | PSI &le; 50
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            <strong>Healthy persons:</strong> Normal outdoor activities.
            <br />
            <strong>Vulnerable groups:</strong> Normal daily activities without restriction.
          </p>
        </div>

        {/* Band 2 */}
        <div className="p-3.5 rounded-xl border border-blue-900/50 bg-blue-950/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-blue-400">Moderate / Elevated</span>
            <span className="font-mono text-[11px] text-blue-300 font-semibold">
              PM2.5 56–150 | PSI 51–100
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            <strong>Healthy persons:</strong> Normal outdoor physical activities.
            <br />
            <strong>Vulnerable groups:</strong> Reduce strenuous outdoor exertion if feeling unwell.
          </p>
        </div>

        {/* Band 3 */}
        <div className="p-3.5 rounded-xl border border-amber-900/50 bg-amber-950/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-amber-400">Unhealthy / High</span>
            <span className="font-mono text-[11px] text-amber-300 font-semibold">
              PM2.5 151–250 | PSI 101–200
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            <strong>Healthy persons:</strong> Reduce prolonged or strenuous outdoor exertion.
            <br />
            <strong>Vulnerable groups:</strong> Avoid outdoor exertion; stay in well-ventilated indoor areas.
          </p>
        </div>

        {/* Band 4 */}
        <div className="p-3.5 rounded-xl border border-rose-900/50 bg-rose-950/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-rose-400">Very Unhealthy / Haz</span>
            <span className="font-mono text-[11px] text-rose-300 font-semibold">
              PM2.5 &gt; 250 | PSI &gt; 200
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            <strong>Healthy persons:</strong> Avoid outdoor physical exertion.
            <br />
            <strong>Vulnerable groups:</strong> Stay indoors; keep windows closed. N95 masks when going out.
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span>
          <strong>Tip:</strong> Use 1-hour PM2.5 for immediate hour-to-hour outdoor plans, and 24-hour PSI for general day-long haze exposure.
        </span>
        <span className="text-slate-500 font-mono">NEA Health Advisory Standard</span>
      </div>
    </div>
  );
};
