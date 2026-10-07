import React, { useState, useEffect } from 'react';
import { ApiHealthReport } from '../types/nea';
import { fetchHealthReport } from '../services/neaService';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Server,
  Zap,
  Clock,
  ShieldCheck,
  X,
} from 'lucide-react';

interface ApiHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiHealthModal: React.FC<ApiHealthModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<ApiHealthReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealthReport();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with health checker');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyEndpointUrl = () => {
    const url = `${window.location.origin}/api/health.js`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                NEA APIs Health Monitor
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  /api/health.js
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time latency, uptime & integrity diagnostics for Data.gov.sg endpoints
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick status bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    report?.status === 'operational'
                      ? 'bg-emerald-400'
                      : report?.status === 'degraded'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    report?.status === 'operational'
                      ? 'bg-emerald-500'
                      : report?.status === 'degraded'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </span>

              <div>
                <span className="text-xs text-slate-400 block">Overall Status</span>
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {report?.status?.replace('_', ' ') || (loading ? 'Checking...' : 'Unknown')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={runCheck}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Testing...' : 'Re-test Now'}</span>
              </button>

              <button
                onClick={copyEndpointUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                title="Copy API URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Endpoint breakdown cards */}
          {report && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Upstream Endpoints Telemetry
              </h4>

              {/* PSI endpoint */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1.5 rounded-lg ${
                        report.services.psi.healthy
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {report.services.psi.healthy ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </span>
                    <div>
                      <h5 className="text-sm font-semibold text-white">
                        {report.services.psi.name}
                      </h5>
                      <span className="text-[11px] font-mono text-slate-400 break-all">
                        {report.services.psi.url}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                      report.services.psi.latencyMs < 300
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : report.services.psi.latencyMs < 1000
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {report.services.psi.latencyMs} ms
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs border-t border-slate-800/80 text-slate-400">
                  <div>
                    <span>HTTP Status: </span>
                    <strong className="text-emerald-400">{report.services.psi.httpStatus} OK</strong>
                  </div>
                  <div>
                    <span>Regions: </span>
                    <strong className="text-white">{report.services.psi.regionCount} stations</strong>
                  </div>
                  <div className="col-span-2">
                    <span>Last Updated: </span>
                    <strong className="text-white font-mono text-[11px]">
                      {report.services.psi.lastUpdated ? new Date(report.services.psi.lastUpdated).toLocaleTimeString() : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* PM2.5 endpoint */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1.5 rounded-lg ${
                        report.services.pm25.healthy
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {report.services.pm25.healthy ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </span>
                    <div>
                      <h5 className="text-sm font-semibold text-white">
                        {report.services.pm25.name}
                      </h5>
                      <span className="text-[11px] font-mono text-slate-400 break-all">
                        {report.services.pm25.url}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                      report.services.pm25.latencyMs < 300
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : report.services.pm25.latencyMs < 1000
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {report.services.pm25.latencyMs} ms
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs border-t border-slate-800/80 text-slate-400">
                  <div>
                    <span>HTTP Status: </span>
                    <strong className="text-emerald-400">{report.services.pm25.httpStatus} OK</strong>
                  </div>
                  <div>
                    <span>Regions: </span>
                    <strong className="text-white">{report.services.pm25.regionCount} stations</strong>
                  </div>
                  <div className="col-span-2">
                    <span>Last Updated: </span>
                    <strong className="text-white font-mono text-[11px]">
                      {report.services.pm25.lastUpdated ? new Date(report.services.pm25.lastUpdated).toLocaleTimeString() : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Raw JSON viewer */}
              <details className="text-xs text-slate-400">
                <summary className="cursor-pointer hover:text-white transition-colors py-1">
                  View Full Health Check JSON Payload
                </summary>
                <pre className="p-3 mt-1 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                  {JSON.stringify(report, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Automated ping rate: On request / 60s cache</span>
          <a
            href="/api/health.js"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors font-medium"
          >
            <span>Open /api/health.js in new tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
