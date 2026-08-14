import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Zap,
  Car,
  Star,
  Shield,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { City, ParkingFacility, VehicleType } from '../types';

interface MapViewProps {
  city: City;
  facilities: ParkingFacility[];
  activeVehicleType: VehicleType;
  onSelectFacility: (facility: ParkingFacility) => void;
  onQuickBook: (facility: ParkingFacility) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  city,
  facilities,
  activeVehicleType,
  onSelectFacility,
  onQuickBook,
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(
    facilities[0]?.id || null
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);

  // Compute relative SVG coordinates based on lat/lng offsets from city center
  const getFacilitySvgCoords = (facility: ParkingFacility, index: number) => {
    // Normalizing coordinates for visual aesthetics
    const latDiff = (facility.coordinates.lat - city.centerCoords.lat) * 2000;
    const lngDiff = (facility.coordinates.lng - city.centerCoords.lng) * 2000;
    
    // Base center is (500, 300)
    const x = 500 + lngDiff * 4;
    const y = 300 - latDiff * 4;

    return {
      x: Math.max(120, Math.min(880, x)),
      y: Math.max(80, Math.min(520, y)),
    };
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-xl relative flex flex-col lg:flex-row min-h-[560px]">
      
      {/* Interactive Map Visualizer Canvas */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-4">
        
        {/* SVG Graphic Map Grid */}
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full max-h-[540px] select-none transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
            <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="1000" height="600" fill="#090d16" />
          <rect width="1000" height="600" fill="url(#map-grid)" />

          {/* Road Network Vectors */}
          <path
            d="M 100 300 Q 400 320 500 300 T 900 280"
            fill="none"
            stroke="#334155"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 500 50 L 500 550"
            fill="none"
            stroke="#334155"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 250 100 Q 500 280 750 500"
            fill="none"
            stroke="#1e293b"
            strokeWidth="5"
            strokeDasharray="6 6"
          />
          <path
            d="M 750 100 Q 500 300 250 500"
            fill="none"
            stroke="#1e293b"
            strokeWidth="5"
            strokeDasharray="6 6"
          />

          {/* Distance Radius Rings from City Center (500, 300) */}
          <circle cx="500" cy="300" r="100" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x="505" y="210" fill="#60a5fa" fontSize="10" fontFamily="monospace" opacity="0.8">0.5 mi</text>

          <circle cx="500" cy="300" r="190" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
          <text x="505" y="120" fill="#0ea5e9" fontSize="10" fontFamily="monospace" opacity="0.7">1.0 mi</text>

          <circle cx="500" cy="300" r="280" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" />
          <text x="505" y="30" fill="#64748b" fontSize="10" fontFamily="monospace" opacity="0.6">2.0 mi</text>

          {/* City Landmark Epicenter Glow */}
          <circle cx="500" cy="300" r="45" fill="url(#center-glow)" />
          <circle cx="500" cy="300" r="8" fill="#3b82f6" className="animate-ping" opacity="0.4" />
          <circle cx="500" cy="300" r="5" fill="#3b82f6" />
          
          <g transform="translate(500, 320)">
            <rect x="-70" y="0" width="140" height="22" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <text x="0" y="14" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">
              ★ {city.landmark}
            </text>
          </g>

          {/* Parking Facility Pins */}
          {facilities.map((fac, index) => {
            const coords = getFacilitySvgCoords(fac, index);
            const isSelected = selectedFacilityId === fac.id;
            const isFull = fac.availableSlots === 0;
            const isLimited = fac.availableSlots > 0 && fac.availableSlots <= 8;

            let pinColor = '#2563eb'; // Royal Blue for Available
            if (isFull) pinColor = '#ef4444'; // Red
            else if (isLimited) pinColor = '#f59e0b'; // Amber

            return (
              <g
                key={fac.id}
                transform={`translate(${coords.x}, ${coords.y})`}
                onClick={() => setSelectedFacilityId(fac.id)}
                className="cursor-pointer transition-all duration-300"
              >
                {/* Connecting Line to Center */}
                <line
                  x1="0"
                  y1="0"
                  x2={500 - coords.x}
                  y2={300 - coords.y}
                  stroke={isSelected ? '#3b82f6' : '#334155'}
                  strokeWidth={isSelected ? '1.5' : '0.5'}
                  strokeDasharray="3 3"
                  opacity={isSelected ? '0.8' : '0.2'}
                />

                {/* Pin Circle */}
                {isSelected && (
                  <circle cx="0" cy="0" r="28" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.6" className="animate-pulse" />
                )}

                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? '20' : '16'}
                  fill={pinColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
                />

                {/* Available Slots Count inside Pin */}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isSelected ? '11' : '10'}
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {fac.availableSlots}
                </text>

                {/* Floating Tag */}
                <g transform="translate(0, -28)">
                  <rect
                    x="-55"
                    y="-12"
                    width="110"
                    height="20"
                    rx="4"
                    fill={isSelected ? '#0f172a' : '#1e293b'}
                    stroke={isSelected ? '#3b82f6' : '#334155'}
                    strokeWidth={isSelected ? '1.5' : '1'}
                  />
                  <text
                    x="0"
                    y="2"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    ${fac.hourlyRate.toFixed(2)}/hr • {fac.distanceMiles}mi
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Map Legend Overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-xs p-3 rounded-lg border border-slate-700 text-xs text-white space-y-1.5 shadow-lg">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
            Live City Map: {city.name}
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span>
            <span>&gt; 8 Slots Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
            <span>Limited Spots (1-8)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-red-500"></span>
            <span>Fully Booked</span>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-1 bg-slate-900/95 backdrop-blur-xs p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.15))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Reset Map View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Facility Detail Flyout Panel */}
      <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 sm:p-6 flex flex-col justify-between shrink-0">
        {selectedFacility ? (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="text-blue-400 font-bold uppercase tracking-wider text-[11px]">
                Active Selection
              </span>
              <span className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded text-xs">
                {selectedFacility.distanceMiles} mi away
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              {selectedFacility.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              {selectedFacility.address}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 my-4">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold">AVAILABLE SPOTS</span>
                <div className="text-lg font-bold text-emerald-400">
                  {selectedFacility.availableSlots} / {selectedFacility.totalSlots}
                </div>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold">HOURLY RATE</span>
                <div className="text-lg font-bold text-blue-400">
                  ${selectedFacility.hourlyRate.toFixed(2)}
                  <span className="text-xs text-slate-400 font-normal">/hr</span>
                </div>
              </div>
            </div>

            {/* EV & Amenities */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Zap className="w-3.5 h-3.5" /> EV Charging Stalls
                </span>
                <span className="font-bold text-white">
                  {selectedFacility.evSlotsAvailable} of {selectedFacility.evSlotsTotal} free
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Rating</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {selectedFacility.rating} ({selectedFacility.reviewsCount} reviews)
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Structure</span>
                <span className="font-medium text-slate-200">
                  {selectedFacility.floors} Levels • {selectedFacility.isCovered ? 'Covered' : 'Open Air'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Click on any pin to inspect real-time bay availability
          </div>
        )}

        {/* Action Buttons */}
        {selectedFacility && (
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <button
              id="map-reserve-btn"
              disabled={selectedFacility.availableSlots === 0}
              onClick={() => onQuickBook(selectedFacility)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-blue-200 disabled:opacity-50"
            >
              <span>Instant Reserve (${selectedFacility.hourlyRate.toFixed(2)}/hr)</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              id="map-inspect-grid-btn"
              onClick={() => onSelectFacility(selectedFacility)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-700"
            >
              View Detailed Floor Layout
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
