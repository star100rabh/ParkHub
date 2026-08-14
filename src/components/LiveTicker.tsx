import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, ArrowDownRight, ArrowUpRight, CheckCircle2, Zap } from 'lucide-react';
import { LiveActivityEvent } from '../types';

interface LiveTickerProps {
  events: LiveActivityEvent[];
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ events }) => {
  const latestEvent = events[0];

  if (!latestEvent) return null;

  const isEntry = latestEvent.type === 'entry';
  const isExit = latestEvent.type === 'exit';
  const isReserved = latestEvent.type === 'reserved';

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold tracking-wider uppercase text-slate-400 text-[10px]">
            Live Telemetry:
          </span>
        </div>

        <div className="flex-1 min-w-[240px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={latestEvent.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-2 truncate text-xs"
            >
              {isEntry && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  <ArrowDownRight className="w-3 h-3 mr-1 text-amber-400" /> Parked
                </span>
              )}
              {isExit && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  <ArrowUpRight className="w-3 h-3 mr-1 text-emerald-400" /> Freed Spot
                </span>
              )}
              {isReserved && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-blue-400" /> Reserved
                </span>
              )}

              <span className="text-slate-200 font-medium">
                {latestEvent.vehicleDescription}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 truncate">
                {latestEvent.facilityName} ({latestEvent.cityName})
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-blue-400 font-mono text-[11px] font-semibold">
                Bay {latestEvent.slotCode}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden lg:flex items-center space-x-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Sync rate: 3s
          </span>
        </div>
      </div>
    </div>
  );
};
