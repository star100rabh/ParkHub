import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Car,
  Zap,
  Accessibility,
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
  CreditCard,
  Download,
  Share2,
} from 'lucide-react';
import { Booking, ParkingFacility, ParkingSlot, VehicleType } from '../types';
import { parkingService } from '../services/parkingService';

interface SlotVisualizerModalProps {
  facility: ParkingFacility | null;
  initialSelectedSlot?: ParkingSlot | null;
  onClose: () => void;
  onBookingComplete: (booking: Booking) => void;
}

export const SlotVisualizerModal: React.FC<SlotVisualizerModalProps> = ({
  facility,
  initialSelectedSlot,
  onClose,
  onBookingComplete,
}) => {
  if (!facility) return null;

  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(
    initialSelectedSlot || facility.slots.find((s) => !s.isOccupied) || null
  );

  // Reservation Form State
  const [vehicleType, setVehicleType] = useState<VehicleType>(
    selectedSlot?.vehicleType || 'compact'
  );
  const [licensePlate, setLicensePlate] = useState<string>('7XYZ892');
  const [vehicleModel, setVehicleModel] = useState<string>('Tesla Model 3');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const floorSlots = facility.slots.filter((s) => s.floor === selectedFloor);
  const floorAvailableCount = floorSlots.filter((s) => !s.isOccupied).length;

  const rateMultiplier = selectedSlot?.rateMultiplier || 1.0;
  const effectiveHourlyRate = facility.hourlyRate * rateMultiplier;
  const totalPrice = Number((effectiveHourlyRate * durationHours).toFixed(2));

  const handleSelectSlot = (slot: ParkingSlot) => {
    if (slot.isOccupied || slot.isReserved) return;
    setSelectedSlot(slot);
    setVehicleType(slot.vehicleType);
    setErrorMessage(null);
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage('Please select an available parking bay');
      return;
    }
    if (!licensePlate.trim()) {
      setErrorMessage('Please enter your vehicle license plate');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const booking = await parkingService.reserveSlot({
        facilityId: facility.id,
        slotId: selectedSlot.id,
        vehicleType,
        licensePlate: licensePlate.trim(),
        vehicleModel: vehicleModel.trim() || 'Vehicle',
        durationHours,
      });

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }

      setCompletedBooking(booking);
      onBookingComplete(booking);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete reservation. Please try another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-slate-800 px-5 py-4 text-white flex items-center justify-between border-b border-slate-700 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs uppercase tracking-widest text-blue-400">
                Floor Plan Bay Visualizer
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300">{facility.neighborhood}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">{facility.name}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-700 text-slate-200 px-2.5 py-1 rounded font-mono font-medium hidden sm:inline">
              {facility.availableSlots} / {facility.totalSlots} Slots Free
            </span>
            <button
              id="close-slot-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6">
          {!completedBooking ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Interactive Multi-Floor Grid (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                
                {/* Floor Switcher & Capacity Stats */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
                    {Array.from({ length: facility.floors }, (_, i) => i + 1).map((fl) => {
                      const isFlSelected = selectedFloor === fl;
                      const flSlots = facility.slots.filter((s) => s.floor === fl);
                      const flAvail = flSlots.filter((s) => !s.isOccupied).length;
                      return (
                        <button
                          key={fl}
                          id={`floor-tab-${fl}`}
                          onClick={() => setSelectedFloor(fl)}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                            isFlSelected
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>Floor {fl}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded ${
                              isFlSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {flAvail} open
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center space-x-3 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-emerald-400 rounded-xs"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-blue-400 rounded-xs"></div>
                      <span>EV Charging</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-red-400 rounded-xs"></div>
                      <span>Occupied</span>
                    </div>
                  </div>
                </div>

                {/* Parking Bay Floor Graphic Layout */}
                <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 shadow-inner">
                  
                  {/* Entrance / Exit Header */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-3 px-1">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      ↑ ENTRY LANE (Floor {selectedFloor})
                    </span>
                    <span className="text-slate-400 font-medium">2-WAY DRIVE AISLE</span>
                    <span className="flex items-center gap-1 text-blue-700 font-bold">
                      ELEVATOR ➔
                    </span>
                  </div>

                  {/* Parking Bay Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-2.5">
                    {floorSlots.map((slot) => {
                      const isOccupied = slot.isOccupied || slot.isReserved;
                      const isSelected = selectedSlot?.id === slot.id;
                      const isEv = slot.isEvCharger;
                      const isAccess = slot.vehicleType === 'accessible';
                      const isMoto = slot.vehicleType === 'motorcycle';

                      let bgClass = 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800 hover:bg-emerald-100';
                      let icon = <Car className="w-4 h-4 text-emerald-600" />;

                      if (isOccupied) {
                        bgClass = 'bg-red-50 border-2 border-red-200 text-red-600 cursor-not-allowed opacity-80';
                        icon = <Car className="w-4 h-4 text-red-400" />;
                      } else if (isEv) {
                        bgClass = 'bg-blue-50 border-2 border-blue-400 text-blue-800 hover:bg-blue-100';
                        icon = <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />;
                      } else if (isAccess) {
                        bgClass = 'bg-sky-50 border-2 border-sky-400 text-sky-800 hover:bg-sky-100';
                        icon = <Accessibility className="w-4 h-4 text-sky-600" />;
                      } else if (isMoto) {
                        bgClass = 'bg-purple-50 border-2 border-purple-400 text-purple-800 hover:bg-purple-100';
                        icon = <Bike className="w-4 h-4 text-purple-600" />;
                      }

                      if (isSelected) {
                        bgClass = 'bg-blue-600 border-2 border-blue-700 text-white ring-4 ring-blue-200 font-bold shadow-md';
                        icon = <Car className="w-4 h-4 text-white" />;
                      }

                      return (
                        <button
                          key={slot.id}
                          id={`slot-btn-${slot.id}`}
                          disabled={isOccupied}
                          onClick={() => handleSelectSlot(slot)}
                          className={`relative p-2.5 rounded-lg border flex flex-col items-center justify-between min-h-[76px] transition-all cursor-pointer ${bgClass}`}
                        >
                          {/* Top Bay Code */}
                          <span className={`text-xs font-mono font-bold tracking-tight ${isSelected ? 'text-white' : ''}`}>
                            {slot.bayCode}
                          </span>

                          {/* Center Icon */}
                          <div className="my-1">
                            {icon}
                          </div>

                          {/* Bottom Info */}
                          <span className={`text-[9px] uppercase tracking-wider font-bold truncate max-w-full ${isSelected ? 'text-white' : ''}`}>
                            {isOccupied
                              ? slot.occupiedCarModel?.split(' ')[0] || 'TAKEN'
                              : isEv
                              ? `${slot.chargerSpeedKw}kW EV`
                              : isAccess
                              ? 'ACCESS'
                              : isMoto
                              ? 'MOTO'
                              : 'OPEN'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Driveway Central Marking */}
                  <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Speed Limit: 5 MPH</span>
                    <span>Level {selectedFloor} Fast Gates Active</span>
                  </div>
                </div>

                {/* Selected Slot Information Banner */}
                {selectedSlot && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-md bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-sm">
                        {selectedSlot.bayCode}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Selected Bay {selectedSlot.bayCode} (Floor {selectedSlot.floor})
                        </h4>
                        <p className="text-[11px] text-blue-800">
                          {selectedSlot.isEvCharger
                            ? `High-Speed EV Charger (${selectedSlot.chargerSpeedKw}kW Fast Stall)`
                            : `Compatible with ${selectedSlot.vehicleType.toUpperCase()} vehicles`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded">
                      ${effectiveHourlyRate.toFixed(2)}/hr
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Reservation Checkout (5 Cols) */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Instant Reservation Checkout
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Guaranteed spot held for 15 minutes before your arrival window.
                  </p>

                  {errorMessage && (
                    <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleConfirmReservation} className="space-y-3.5">
                    
                    {/* Vehicle Type Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Vehicle Type
                      </label>
                      <select
                        id="form-vehicle-type"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                        className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="compact">Sedan / Compact</option>
                        <option value="suv">SUV / Crossover / Truck</option>
                        <option value="ev">Electric Vehicle (EV)</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="accessible">Accessible Parking</option>
                      </select>
                    </div>

                    {/* License Plate & Car Model */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          License Plate
                        </label>
                        <input
                          id="form-license-plate"
                          type="text"
                          required
                          value={licensePlate}
                          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                          placeholder="e.g. 7XYZ892"
                          className="w-full text-xs font-mono font-bold uppercase bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Vehicle Model
                        </label>
                        <input
                          id="form-vehicle-model"
                          type="text"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          placeholder="e.g. Tesla Model 3"
                          className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Parking Duration Hours */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Duration</span>
                        <span className="text-blue-600 font-bold">{durationHours} Hours</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 4, 8].map((hrs) => (
                          <button
                            type="button"
                            key={hrs}
                            id={`duration-btn-${hrs}`}
                            onClick={() => setDurationHours(hrs)}
                            className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              durationHours === hrs
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {hrs} {hrs === 1 ? 'hr' : 'hrs'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Breakdown Box */}
                    <div className="bg-white rounded-lg border border-slate-200 p-3 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Base Rate</span>
                        <span>${facility.hourlyRate.toFixed(2)}/hr</span>
                      </div>
                      {selectedSlot?.isEvCharger && (
                        <div className="flex justify-between text-blue-700 font-medium">
                          <span>EV Supercharger Surcharge</span>
                          <span>+20%</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>Duration Multiplier</span>
                        <span>× {durationHours} hrs</span>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm text-slate-900">
                        <span>Total Due</span>
                        <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      id="confirm-booking-submit-btn"
                      disabled={isSubmitting || !selectedSlot}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-bold text-sm shadow-md shadow-blue-200 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span className="animate-pulse">Generating Secure Pass...</span>
                      ) : (
                        <>
                          <span>Confirm & Get Gate Pass</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                  </form>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Free cancellation up to 10m
                  </span>
                  <span className="font-semibold text-blue-600">Instant Gate QR</span>
                </div>
              </div>

            </div>
          ) : (
            /* Digital Parking Pass Confirmation Screen */
            <div className="max-w-md mx-auto py-4 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Reservation Confirmed!</h3>
              <p className="text-xs text-slate-500 mb-6">
                Your spot has been locked in the ParkHub Real-Time City Network.
              </p>

              {/* Digital Pass Ticket Card */}
              <div className="bg-slate-900 text-white rounded-xl p-6 text-left shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

                <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
                      PARKHUB SMART GATE PASS
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      {completedBooking.facilityName}
                    </h4>
                    <p className="text-xs text-slate-400">{completedBooking.facilityAddress}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-400 font-mono">
                      {completedBooking.slotBayCode}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Floor {completedBooking.floor}</span>
                  </div>
                </div>

                {/* Pass Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">LICENSE PLATE</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {completedBooking.licensePlate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">DURATION</span>
                    <span className="font-bold text-white text-sm">
                      {completedBooking.durationHours} Hours (${completedBooking.totalPaid.toFixed(2)})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">VEHICLE</span>
                    <span className="text-slate-300 font-medium">{completedBooking.vehicleModel}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">STATUS</span>
                    <span className="inline-flex items-center text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                      ACTIVE PASS
                    </span>
                  </div>
                </div>

                {/* Barcode / QR Simulation */}
                <div className="bg-white rounded-lg p-3.5 flex items-center justify-between text-slate-900">
                  <div className="flex items-center space-x-3">
                    <QrCode className="w-10 h-10 text-slate-900 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        AUTOMATED SCAN CODE
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {completedBooking.qrPassCode}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold">
                    Scan at Gate
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <button
                  id="close-pass-btn"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm shadow-blue-200"
                >
                  Done & Back to Grid
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
