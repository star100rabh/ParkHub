import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Ticket,
  MapPin,
  Clock,
  Car,
  QrCode,
  AlertCircle,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Booking } from '../types';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onCancelBooking,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-800 text-white flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Active Gate Passes</h2>
              <p className="text-xs text-slate-300">ParkHub Access Passes & History</p>
            </div>
          </div>
          <button
            id="close-bookings-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Ticket className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No active passes yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Reserve a real-time parking bay in any city to generate instant digital gate passes.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {bookings.map((booking) => {
                const isActive = booking.status === 'active';
                return (
                  <div
                    key={booking.id}
                    className={`rounded-xl border p-4 sm:p-5 transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-700 shadow-md'
                        : 'bg-slate-50 text-slate-600 border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Header: Facility & Bay */}
                    <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              isActive
                                ? 'bg-blue-900/60 text-blue-300 border border-blue-600'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isActive ? 'ACTIVE GATE PASS' : 'CANCELLED'}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{booking.cityName}</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">
                          {booking.facilityName}
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          {booking.facilityAddress}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-blue-400">
                          {booking.slotBayCode}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Floor {booking.floor}</span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3.5">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">LICENSE PLATE</span>
                        <span className="font-mono font-bold text-white">{booking.licensePlate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">VEHICLE</span>
                        <span className="text-slate-200 font-medium truncate block">
                          {booking.vehicleModel}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">DURATION</span>
                        <span className="text-slate-200 font-medium">
                          {booking.durationHours} Hours (${booking.totalPaid.toFixed(2)})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">GATE SCAN CODE</span>
                        <span className="font-mono text-blue-400 font-bold text-xs truncate block">
                          {booking.qrPassCode}
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    {isActive && (
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                        <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-bold">
                          <QrCode className="w-4 h-4" />
                          <span>Contactless Gate Pass Ready</span>
                        </div>
                        <button
                          id={`cancel-booking-btn-${booking.id}`}
                          onClick={() => onCancelBooking(booking.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancel Pass</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
