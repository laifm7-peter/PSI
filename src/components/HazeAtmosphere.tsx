import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Wind, SlidersHorizontal, Sun, CloudFog } from 'lucide-react';

interface HazeAtmosphereProps {
  psiValue: number;
  pm25Value: number;
  simulatedPsi: number | null;
  onSimulatePsiChange: (psi: number | null) => void;
  enabled: boolean;
  onToggleEnabled: () => void;
}

export const HazeAtmosphere: React.FC<HazeAtmosphereProps> = ({
  psiValue,
  pm25Value,
  simulatedPsi,
  onSimulatePsiChange,
  enabled,
  onToggleEnabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showSimulatorDrawer, setShowSimulatorDrawer] = useState(false);

  // Active PSI either from simulation or live data
  const effectivePsi = simulatedPsi !== null ? simulatedPsi : psiValue;

  // Derive haze intensity index (0 to 100)
  // PSI <= 50 -> 0-15 (clear)
  // PSI 51-100 -> 16-40 (mild)
  // PSI 101-200 -> 41-75 (hazy / unhealthy)
  // PSI > 200 -> 76-100 (severe / hazardous)
  let hazeIntensity = 0;
  let hazeCategory: 'clear' | 'mild' | 'hazy' | 'dense' | 'severe' = 'clear';
  let visibilityKm = '10+';

  if (effectivePsi <= 50 && pm25Value <= 35) {
    hazeIntensity = Math.min(15, (effectivePsi / 50) * 15);
    hazeCategory = 'clear';
    visibilityKm = '> 10 km (Excellent)';
  } else if (effectivePsi <= 100) {
    hazeIntensity = 15 + ((effectivePsi - 50) / 50) * 25;
    hazeCategory = 'mild';
    visibilityKm = '7 – 10 km (Good)';
  } else if (effectivePsi <= 150) {
    hazeIntensity = 40 + ((effectivePsi - 100) / 50) * 25;
    hazeCategory = 'hazy';
    visibilityKm = '4 – 6 km (Moderate Haze)';
  } else if (effectivePsi <= 200) {
    hazeIntensity = 65 + ((effectivePsi - 150) / 50) * 20;
    hazeCategory = 'dense';
    visibilityKm = '2 – 4 km (Unhealthy Smog)';
  } else {
    hazeIntensity = Math.min(100, 85 + ((effectivePsi - 200) / 100) * 15);
    hazeCategory = 'severe';
    visibilityKm = '< 2 km (Dense Hazardous Smog)';
  }

  // Canvas particle animation
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Number of particles proportional to haze intensity
    // Clear: 25 motes, Severe: 150 motes
    const particleCount = Math.floor(25 + (hazeIntensity / 100) * 135);

    interface Particle {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      opacity: number;
      pulseSpeed: number;
      pulsePhase: number;
      color: string;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const isSmogParticle = Math.random() < hazeIntensity / 100;
      const size = isSmogParticle ? Math.random() * 3.5 + 1.2 : Math.random() * 1.8 + 0.8;
      
      // Color palette shifts from soft blue-white to yellowish amber / smog gray
      let color = 'rgba(255, 255, 255, ';
      if (hazeCategory === 'severe') {
        color = Math.random() > 0.4 ? 'rgba(180, 140, 110, ' : 'rgba(160, 160, 160, ';
      } else if (hazeCategory === 'dense' || hazeCategory === 'hazy') {
        color = Math.random() > 0.5 ? 'rgba(217, 180, 130, ' : 'rgba(230, 200, 160, ';
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: size,
        speedX: (Math.random() * 0.4 + 0.15) * (Math.random() > 0.2 ? 1 : -0.5), // drifting eastwards with tropical wind
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.4 + 0.15,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
        color,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle drifting smog clouds if hazy
      if (hazeIntensity > 30) {
        const cloudOpacity = ((hazeIntensity - 30) / 70) * 0.25;
        const grad = ctx.createRadialGradient(
          width * 0.3 + Math.sin(time * 0.2) * 50,
          height * 0.4,
          50,
          width * 0.3,
          height * 0.4,
          width * 0.7
        );
        grad.addColorStop(0, `rgba(217, 165, 100, ${cloudOpacity})`);
        grad.addColorStop(1, 'rgba(200, 180, 150, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        const grad2 = ctx.createRadialGradient(
          width * 0.75 + Math.cos(time * 0.15) * 60,
          height * 0.6,
          40,
          width * 0.75,
          height * 0.6,
          width * 0.6
        );
        grad2.addColorStop(0, `rgba(180, 140, 100, ${cloudOpacity * 0.8})`);
        grad2.addColorStop(1, 'rgba(160, 140, 120, 0)');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw drifting particulate matter
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulsePhase += p.pulseSpeed;

        if (p.x > width + 10) p.x = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.y < -10) p.y = height + 10;

        const currentOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulsePhase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentOpacity})`;
        ctx.fill();

        // Extra soft blur for larger smog motes
        if (p.radius > 2.5 && hazeIntensity > 40) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${currentOpacity * 0.25})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hazeIntensity, hazeCategory, enabled]);

  // Compute CSS gradient background based on haze level
  const getAtmosphericBackground = () => {
    if (!enabled) return 'bg-slate-900';

    if (hazeCategory === 'severe') {
      // Dark brownish-red / polluted smog sky
      return 'from-amber-950/80 via-stone-900 to-amber-950/60';
    }
    if (hazeCategory === 'dense') {
      // Noticeable sepia / brownish orange haze
      return 'from-stone-900 via-amber-950/40 to-slate-900';
    }
    if (hazeCategory === 'hazy') {
      // Warm amber haze tinting the atmosphere
      return 'from-slate-900 via-stone-900/90 to-amber-950/20';
    }
    if (hazeCategory === 'mild') {
      return 'from-slate-900 via-slate-900/95 to-slate-950';
    }
    // Clear blue-sky night/day
    return 'from-slate-900 via-slate-900 to-slate-950';
  };

  // Silhouette opacity decreases as haze thickens (mimics reduced visual range)
  const skylineOpacity = Math.max(0.08, 0.45 - (hazeIntensity / 100) * 0.38);
  const skylineBlur = Math.min(8, (hazeIntensity / 100) * 8);

  return (
    <>
      {/* Background layer container */}
      <div
        className={`fixed inset-0 pointer-events-none -z-10 transition-colors duration-1000 bg-gradient-to-b ${getAtmosphericBackground()}`}
      >
        {/* Dynamic Sun disk (diffused or hidden in smog) */}
        {enabled && (
          <div
            className="absolute top-12 right-1/4 rounded-full transition-all duration-1000"
            style={{
              width: hazeIntensity > 50 ? '160px' : '100px',
              height: hazeIntensity > 50 ? '160px' : '100px',
              background:
                hazeIntensity > 75
                  ? 'radial-gradient(circle, rgba(234, 88, 12, 0.25) 0%, rgba(180, 83, 9, 0.1) 60%, transparent 80%)'
                  : hazeIntensity > 40
                  ? 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(245, 158, 11, 0.15) 50%, transparent 75%)'
                  : 'radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, rgba(59, 130, 246, 0.1) 60%, transparent 80%)',
              filter: `blur(${Math.max(4, hazeIntensity * 0.3)}px)`,
              opacity: hazeIntensity > 85 ? 0.4 : 0.85,
            }}
          />
        )}

        {/* Singapore Skyline Silhouette with depth blur that fades in smog */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 md:h-64 transition-all duration-1000 overflow-hidden"
          style={{
            opacity: enabled ? skylineOpacity : 0.2,
            filter: enabled ? `blur(${skylineBlur}px)` : 'none',
          }}
        >
          <svg
            className="w-full h-full text-slate-400 dark:text-slate-300 fill-current preserve-3d"
            viewBox="0 0 1200 240"
            preserveAspectRatio="none"
          >
            {/* Singapore landmark silhouette shapes */}
            {/* Port Cranes (Jurong/Tuas) */}
            <path d="M20 240 L20 170 L50 140 L70 140 L40 170 L40 240 Z" opacity="0.5" />
            <path d="M75 240 L75 160 L115 130 L135 130 L95 160 L95 240 Z" opacity="0.6" />

            {/* CBD Towers */}
            <rect x="180" y="70" width="35" height="170" />
            <rect x="225" y="40" width="45" height="200" />
            <polygon points="225,40 247,15 270,40" />
            <rect x="280" y="85" width="40" height="155" />
            <rect x="330" y="110" width="30" height="130" />
            <rect x="370" y="60" width="50" height="180" />

            {/* Marina Bay Sands 3 Towers + Skypark */}
            <rect x="520" y="90" width="28" height="150" />
            <rect x="560" y="90" width="28" height="150" />
            <rect x="600" y="90" width="28" height="150" />
            {/* MBS Skypark Boat cantilever */}
            <path d="M500 88 C 550 82, 630 82, 650 88 L645 96 C 625 92, 550 92, 508 96 Z" />

            {/* Singapore ArtScience Museum lotus petals */}
            <path d="M470 240 L470 180 C 475 165, 495 165, 500 180 L500 240 Z" />

            {/* Singapore Flyer Wheel */}
            <circle cx="730" cy="130" r="50" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.7" />
            <circle cx="730" cy="130" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.7" />
            <line x1="730" y1="130" x2="710" y2="240" stroke="currentColor" strokeWidth="4" />
            <line x1="730" y1="130" x2="750" y2="240" stroke="currentColor" strokeWidth="4" />

            {/* Gardens by the Bay Supertrees */}
            <path d="M820 240 C 822 190, 815 170, 830 150 C 840 140, 850 140, 860 150 C 875 170, 868 190, 870 240 Z" />
            <path d="M890 240 C 892 200, 888 185, 900 170 C 908 160, 918 160, 925 170 C 938 185, 932 200, 935 240 Z" />

            {/* East Residential / Changi Control Tower */}
            <rect x="1000" y="110" width="16" height="130" />
            <polygon points="995,110 1021,110 1018,95 998,95" />
            <rect x="1050" y="130" width="60" height="110" />
            <rect x="1120" y="145" width="55" height="95" />

            {/* Ground water line */}
            <rect x="0" y="235" width="1200" height="5" />
          </svg>
        </div>

        {/* Smog Fog Layer overlay */}
        {enabled && hazeIntensity > 20 && (
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: (hazeIntensity / 100) * 0.7,
              background:
                hazeIntensity > 75
                  ? 'radial-gradient(circle at 50% 60%, rgba(180, 100, 40, 0.35) 0%, rgba(80, 50, 30, 0.45) 100%)'
                  : 'radial-gradient(circle at 50% 60%, rgba(217, 165, 80, 0.25) 0%, rgba(70, 60, 50, 0.25) 100%)',
            }}
          />
        )}

        {/* Active Particle Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Floating Weather & Haze Effect Bar / Controls */}
      <aside aria-label="Atmospheric haze monitor and visual controls" className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-2 pb-1">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-all text-xs ${
            hazeCategory === 'severe'
              ? 'bg-rose-950/80 border-rose-700/60 text-rose-200'
              : hazeCategory === 'dense'
              ? 'bg-orange-950/70 border-orange-700/60 text-orange-200'
              : hazeCategory === 'hazy'
              ? 'bg-amber-950/60 border-amber-700/50 text-amber-200'
              : 'bg-slate-900/60 border-slate-700/60 text-slate-300'
          } backdrop-blur-md shadow-md`}
        >
          {/* Status info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                hazeCategory === 'severe'
                  ? 'bg-rose-600/30 text-rose-300 animate-pulse'
                  : hazeCategory === 'dense' || hazeCategory === 'hazy'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-blue-500/20 text-blue-300'
              }`}
            >
              {hazeCategory === 'clear' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <CloudFog className="w-4 h-4" />
              )}
            </div>

            <div className="truncate">
              <span className="font-semibold capitalize">
                {hazeCategory === 'clear' ? 'Clear Tropical Atmosphere' : `${hazeCategory} Haze Detected`}
              </span>
              <span className="hidden sm:inline text-slate-400 mx-1.5">·</span>
              <span className="hidden sm:inline text-slate-300">
                Visual Range: {visibilityKm}
              </span>
              {simulatedPsi !== null && (
                <span className="ml-2 px-2 py-0.5 rounded bg-purple-900/70 text-purple-200 font-mono text-[10px] uppercase tracking-wider">
                  Simulation: PSI {simulatedPsi}
                </span>
              )}
            </div>
          </div>

          {/* Interactive controls */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              onClick={() => setShowSimulatorDrawer(!showSimulatorDrawer)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors"
              title="Test haze effects with simulator"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>{showSimulatorDrawer ? 'Close Controls' : 'Haze Simulator'}</span>
            </button>

            <button
              onClick={onToggleEnabled}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                enabled
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-900/90 border-slate-800 text-slate-500 line-through'
              }`}
              title={enabled ? 'Turn off atmospheric weather effects' : 'Turn on atmospheric weather effects'}
            >
              {enabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{enabled ? 'Effects On' : 'Effects Off'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Atmospheric Simulator Drawer */}
        {showSimulatorDrawer && (
          <div className="mt-2 p-4 rounded-xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-xl text-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2 text-white">
                  <Wind className="w-4 h-4 text-amber-400" />
                  Atmospheric Haze Weather Simulator
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Preview how the user interface and background skyline visually transform as haze levels escalate.
                </p>
              </div>

              {simulatedPsi !== null && (
                <button
                  onClick={() => onSimulatePsiChange(null)}
                  className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs hover:bg-emerald-900/60 transition-colors"
                >
                  Reset to Live NEA Data ({psiValue} PSI)
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              <button
                onClick={() => onSimulatePsiChange(25)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  simulatedPsi === 25
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-medium text-xs">Clear (Good)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">PSI 25 · 10+ km visibility</div>
              </button>

              <button
                onClick={() => onSimulatePsiChange(75)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  simulatedPsi === 75
                    ? 'bg-blue-950/70 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-medium text-xs">Moderate</div>
                <div className="text-[11px] text-slate-400 mt-0.5">PSI 75 · Faint depth haze</div>
              </button>

              <button
                onClick={() => onSimulatePsiChange(145)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  simulatedPsi === 145
                    ? 'bg-amber-950/70 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-medium text-xs">Unhealthy Haze</div>
                <div className="text-[11px] text-slate-400 mt-0.5">PSI 145 · Drifting smog & sepia tint</div>
              </button>

              <button
                onClick={() => onSimulatePsiChange(265)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  simulatedPsi === 265
                    ? 'bg-rose-950/70 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-medium text-xs">Dense Hazardous Smog</div>
                <div className="text-[11px] text-slate-400 mt-0.5">PSI 265+ · Skyline hidden, thick ash</div>
              </button>
            </div>

            {/* Slider control */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-4">
              <span className="text-xs text-slate-400 shrink-0">Fine-tune PSI:</span>
              <input
                type="range"
                min="10"
                max="350"
                value={effectivePsi}
                onChange={(e) => onSimulatePsiChange(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <span className="font-mono text-xs font-semibold text-amber-400 shrink-0 w-12 text-right">
                {effectivePsi}
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
