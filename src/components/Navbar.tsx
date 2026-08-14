import React from 'react';
import { Car, Zap, ShieldCheck, Ticket, Radio, Building2, User, ChevronDown } from 'lucide-react';
import { Booking } from '../types';

interface NavbarProps {
  activeBookingsCount: number;
  onOpenBookings: () => void;
  totalFacilitiesCount: number;
  totalAvailableSpots: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeBookingsCount,
  onOpenBookings,
  totalFacilitiesCount,
  totalAvailableSpots,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-sm shadow-blue-200">
              <div className="w-4 h-4 border-2 border-white rounded-xs flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-xs"></div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-slate-800">
                Park<span className="text-blue-600">Hub</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse mr-1.5"></span>
                Live Network
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Professional Corporate Bar) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <span className="text-blue-600 border-b-2 border-blue-600 py-5 font-semibold cursor-default">
              Find Parking
            </span>
            <button
              onClick={onOpenBookings}
              className="py-5 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1.5 text-slate-600 font-medium"
            >
              <span>Reservations</span>
              {activeBookingsCount > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                  {activeBookingsCount}
                </span>
              )}
            </button>
            <span className="py-5 text-slate-400 cursor-not-allowed hidden lg:inline">
              Monthly Pass
            </span>
            <span className="py-5 text-slate-400 cursor-not-allowed hidden lg:inline">
              Fleet Support
            </span>
          </nav>

          {/* Right Actions & Telemetry */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Live Count Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded bg-slate-50 border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600">
                <strong className="text-slate-900 font-bold">{totalAvailableSpots}</strong> slots open
              </span>
            </div>

            {/* Passes Button */}
            <button
              id="my-bookings-btn"
              onClick={onOpenBookings}
              className="relative inline-flex items-center justify-center space-x-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-all cursor-pointer border border-slate-200 shadow-xs"
            >
              <Ticket className="w-4 h-4 text-blue-600" />
              <span>My Passes</span>
              {activeBookingsCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-blue-600 rounded">
                  {activeBookingsCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
