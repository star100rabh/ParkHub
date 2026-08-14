import React from 'react';
import {
  MapPin,
  Star,
  Zap,
  Shield,
  Clock,
  Car,
  Footprints,
  Umbrella,
  CheckCircle2,
  ChevronRight,
  Accessibility,
  Bike,
} from 'lucide-react';
import { ParkingFacility, VehicleType } from '../types';

interface FacilityCardProps {
  facility: ParkingFacility;
  activeVehicleType: VehicleType;
  onSelectFacility: (facility: ParkingFacility) => void;
  onQuickBook: (facility: ParkingFacility) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  activeVehicleType,
  onSelectFacility,
  onQuickBook,
}) => {
  const isFull = facility.availableSlots === 0;
  const isLimited = facility.availableSlots > 0 && facility.availableSlots <= 8;
  const occupancyPercent = Math.round(
    ((facility.totalSlots - facility.availableSlots) / facility.totalSlots) * 100
  );

  // Status badge matching Professional Polish
  let statusBadge = (
    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
      {facility.availableSlots} Slots Free
    </span>
  );

  if (isFull) {
    statusBadge = (
      <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
        Full
      </span>
    );
  } else if (isLimited) {
    statusBadge = (
      <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
        {facility.availableSlots} Slots Left
      </span>
    );
  }

  return (
    <div
      id={`facility-card-${facility.id}`}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
    >
      {/* Top Media & Tags */}
      <div>
        <div className="relative h-40 w-full overflow-hidden bg-slate-100">
          <img
            src={facility.imageUrl}
            alt={facility.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

          {/* Top Left: Status */}
          <div className="absolute top-3 left-3 flex items-center space-x-1.5">
            {statusBadge}
          </div>

          {/* Top Right: Rating */}
          <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur-xs text-xs font-bold border border-white/10">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{facility.rating}</span>
            <span className="text-slate-400 font-normal">({facility.reviewsCount})</span>
          </div>

          {/* Bottom Overlay inside Photo: Price & Neighborhood */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
            <div>
              <span className="text-[11px] font-medium text-slate-300 block">
                {facility.neighborhood}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight line-clamp-1">
                {facility.name}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <div className="text-base sm:text-lg font-extrabold text-white leading-none">
                ${facility.hourlyRate.toFixed(2)}
                <span className="text-xs font-normal text-slate-300">/hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4">
          
          {/* Distance & Address */}
          <div className="flex items-center justify-between text-xs text-slate-600 mb-3 pb-2.5 border-b border-slate-100">
            <div className="flex items-center space-x-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate text-slate-700 font-medium">{facility.address}</span>
            </div>
            <div className="flex items-center space-x-2 shrink-0 pl-2 font-semibold text-slate-700">
              <span className="text-blue-600">
                {facility.distanceMiles} mi away
              </span>
              <span className="text-slate-400 flex items-center gap-0.5 font-normal">
                <Footprints className="w-3 h-3" />
                {facility.walkingTimeMinutes}m
              </span>
            </div>
          </div>

          {/* Occupancy Visual Progress Bar */}
          <div className="mb-3.5">
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span className="flex items-center gap-1 text-slate-500">
                <Car className="w-3.5 h-3.5" />
                Live Occupancy
              </span>
              <span className="font-bold text-slate-800">
                {facility.availableSlots} of {facility.totalSlots} open
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  isFull
                    ? 'bg-red-500'
                    : isLimited
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, occupancyPercent))}%` }}
              ></div>
            </div>
          </div>

          {/* Specific Vehicle Type Breakdown Pills */}
          <div className="grid grid-cols-3 gap-1.5 mb-3.5 text-[11px]">
            {/* EV Stalls */}
            <div
              className={`p-1.5 rounded border text-center transition-colors ${
                activeVehicleType === 'ev'
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold ring-1 ring-blue-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-1 text-blue-600 font-bold text-[11px]">
                <Zap className="w-3 h-3" />
                <span>{facility.evSlotsAvailable} EV</span>
              </div>
              <span className="text-[10px] text-slate-400">of {facility.evSlotsTotal} bays</span>
            </div>

            {/* Accessible */}
            <div
              className={`p-1.5 rounded border text-center transition-colors ${
                activeVehicleType === 'accessible'
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold ring-1 ring-blue-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-1 text-slate-700 font-bold text-[11px]">
                <Accessibility className="w-3 h-3 text-blue-600" />
                <span>{facility.accessibleSlotsAvailable} Access</span>
              </div>
              <span className="text-[10px] text-slate-400">stalls</span>
            </div>

            {/* Motorcycle */}
            <div
              className={`p-1.5 rounded border text-center transition-colors ${
                activeVehicleType === 'motorcycle'
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold ring-1 ring-blue-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-1 text-slate-700 font-bold text-[11px]">
                <Bike className="w-3 h-3 text-blue-600" />
                <span>{facility.motorcycleSlotsAvailable} Moto</span>
              </div>
              <span className="text-[10px] text-slate-400">spaces</span>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="flex flex-wrap gap-1 mb-3">
            {facility.isCovered && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                <Umbrella className="w-2.5 h-2.5 mr-1 text-slate-500" /> Covered
              </span>
            )}
            {facility.isOpen24Hours && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                <Clock className="w-2.5 h-2.5 mr-1 text-slate-500" /> 24/7 Access
              </span>
            )}
            {facility.hasSecurityGuard && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                <Shield className="w-2.5 h-2.5 mr-1 text-blue-600" /> Security
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
              {facility.floors} Floors
            </span>
          </div>

        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="px-4 pb-4 pt-0 grid grid-cols-2 gap-2">
        <button
          id={`view-slots-btn-${facility.id}`}
          onClick={() => onSelectFacility(facility)}
          className="flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
        >
          <span>Floor Bays</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          id={`reserve-btn-${facility.id}`}
          disabled={isFull}
          onClick={() => onQuickBook(facility)}
          className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isFull
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-200'
          }`}
        >
          <span>{isFull ? 'Sold Out' : 'Reserve Spot'}</span>
        </button>
      </div>
    </div>
  );
};
