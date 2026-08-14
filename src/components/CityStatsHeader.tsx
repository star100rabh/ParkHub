import React from 'react';
import { MapPin, Zap, DollarSign, Car, Shield, Compass, Sparkles, Building2 } from 'lucide-react';
import { City, ParkingFacility } from '../types';

interface CityStatsHeaderProps {
  city: City;
  facilities: ParkingFacility[];
  activeVehicleType: string;
}

export const CityStatsHeader: React.FC<CityStatsHeaderProps> = ({
  city,
  facilities,
  activeVehicleType,
}) => {
  const totalSlots = facilities.reduce((sum, f) => sum + f.totalSlots, 0);
  const availableSlots = facilities.reduce((sum, f) => sum + f.availableSlots, 0);
  const evSlotsAvailable = facilities.reduce((sum, f) => sum + f.evSlotsAvailable, 0);
  const avgPrice =
    facilities.length > 0
      ? (facilities.reduce((sum, f) => sum + f.hourlyRate, 0) / facilities.length).toFixed(2)
      : '0.00';

  const occupancyPercent =
    totalSlots > 0 ? Math.round(((totalSlots - availableSlots) / totalSlots) * 100) : 0;

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Left: City Info */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Metropolitan Live Grid</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{city.state}, {city.country}</span>
            </div>

            <div className="flex items-baseline space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {city.name} Parking Network
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Epicenter: <strong className="text-white">{city.landmark}</strong></span>
              <span className="text-slate-500 hidden sm:inline">— {city.tagline}</span>
            </p>
          </div>

          {/* Right: Quick Real-Time Metrics Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            {/* Available Spots */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>Free Spots</span>
                <Car className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-white flex items-baseline gap-1">
                <span className="text-emerald-400">{availableSlots}</span>
                <span className="text-xs text-slate-500 font-normal">/ {totalSlots}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(8, 100 - occupancyPercent)}%` }}
                ></div>
              </div>
            </div>

            {/* EV Chargers */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>EV Charging</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-white flex items-baseline gap-1">
                <span className="text-amber-400">{evSlotsAvailable}</span>
                <span className="text-xs text-slate-500 font-normal">open</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                50kW - 250kW Stalls
              </span>
            </div>

            {/* Avg Price */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>Avg Rate</span>
                <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-white flex items-baseline gap-0.5">
                <span className="text-blue-400">${avgPrice}</span>
                <span className="text-xs text-slate-500 font-normal">/ hr</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                Live Dynamic Rates
              </span>
            </div>

            {/* Live Status */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>Network</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="text-sm font-bold text-emerald-400 mt-1">
                Active Telemetry
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                {facilities.length} Garages Syncing
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
