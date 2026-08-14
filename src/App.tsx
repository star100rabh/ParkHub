import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { LiveTicker } from './components/LiveTicker';
import { CityStatsHeader } from './components/CityStatsHeader';
import { FilterBar } from './components/FilterBar';
import { FacilityCard } from './components/FacilityCard';
import { MapView } from './components/MapView';
import { SlotVisualizerModal } from './components/SlotVisualizerModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { CITIES } from './data/mockData';
import { parkingService } from './services/parkingService';
import {
  Booking,
  City,
  FilterOptions,
  LiveActivityEvent,
  ParkingFacility,
  ParkingSlot,
} from './types';
import { Car, AlertCircle, Sparkles, Compass, ShieldCheck } from 'lucide-react';

export default function App() {
  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveActivityEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Active Filter Options
  const [filters, setFilters] = useState<FilterOptions>({
    selectedCity: 'nyc',
    vehicleType: 'all',
    maxPrice: 25,
    maxDistance: 5,
    searchQuery: '',
    sortBy: 'price-asc',
    onlyAvailable: false,
    onlyEvCharging: false,
    onlyCovered: false,
    only24Hours: false,
  });

  // Modals state
  const [selectedFacilityForModal, setSelectedFacilityForModal] = useState<ParkingFacility | null>(null);
  const [selectedSlotForModal, setSelectedSlotForModal] = useState<ParkingSlot | null>(null);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState<boolean>(false);

  // Subscribe to real-time updates from the Parking API Service
  useEffect(() => {
    // Initial fetch of bookings
    setBookings(parkingService.getBookings());
    setLiveEvents(parkingService.getRecentEvents());

    // Subscribe to live facility changes
    const unsubscribeFacilities = parkingService.subscribe((updatedFacilities) => {
      setFacilities(updatedFacilities);
    });

    // Subscribe to live activity stream
    const unsubscribeEvents = parkingService.subscribeEvents((newEvent) => {
      setLiveEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
    });

    return () => {
      unsubscribeFacilities();
      unsubscribeEvents();
    };
  }, []);

  // Compute live availability map per city
  const cityAvailabilityMap = useMemo(() => {
    const map: Record<string, { available: number; total: number }> = {};
    CITIES.forEach((c) => {
      const cityFacs = facilities.filter((f) => f.cityId === c.id);
      const total = cityFacs.reduce((sum, f) => sum + f.totalSlots, 0);
      const available = cityFacs.reduce((sum, f) => sum + f.availableSlots, 0);
      map[c.id] = { available, total };
    });
    return map;
  }, [facilities]);

  // Filter & Sort facilities based on active filters
  const filteredFacilities = useMemo(() => {
    let result = facilities.filter((facility) => {
      // 1. City
      if (filters.selectedCity && facility.cityId !== filters.selectedCity) {
        return false;
      }

      // 2. Vehicle Type
      if (filters.vehicleType !== 'all') {
        const hasSlotForType = facility.slots.some(
          (s) => s.vehicleType === filters.vehicleType && (!filters.onlyAvailable || !s.isOccupied)
        );
        if (!hasSlotForType) return false;
      }

      // 3. Max Price
      if (filters.maxPrice && facility.hourlyRate > filters.maxPrice) {
        return false;
      }

      // 4. Max Distance
      if (filters.maxDistance && facility.distanceMiles > filters.maxDistance) {
        return false;
      }

      // 5. Available Only
      if (filters.onlyAvailable && facility.availableSlots <= 0) {
        return false;
      }

      // 6. EV Fast Charger
      if (filters.onlyEvCharging && facility.evSlotsAvailable <= 0) {
        return false;
      }

      // 7. Covered
      if (filters.onlyCovered && !facility.isCovered) {
        return false;
      }

      // 8. 24 Hours
      if (filters.only24Hours && !facility.isOpen24Hours) {
        return false;
      }

      // 9. Search
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = facility.name.toLowerCase().includes(q);
        const matchesArea = facility.neighborhood.toLowerCase().includes(q);
        const matchesAddr = facility.address.toLowerCase().includes(q);
        const matchesFeature = facility.features.some((f) => f.toLowerCase().includes(q));
        if (!matchesName && !matchesArea && !matchesAddr && !matchesFeature) {
          return false;
        }
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.hourlyRate - b.hourlyRate;
        case 'price-desc':
          return b.hourlyRate - a.hourlyRate;
        case 'distance-asc':
          return a.distanceMiles - b.distanceMiles;
        case 'availability-desc':
          return b.availableSlots - a.availableSlots;
        case 'rating-desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [facilities, filters]);

  const activeCity = CITIES.find((c) => c.id === filters.selectedCity) || CITIES[0];
  const activeBookings = bookings.filter((b) => b.status === 'active');
  const totalAvailableAcrossCities = facilities.reduce((sum, f) => sum + f.availableSlots, 0);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters((prev) => ({
      ...prev,
      vehicleType: 'all',
      maxPrice: 25,
      maxDistance: 5,
      searchQuery: '',
      sortBy: 'price-asc',
      onlyAvailable: false,
      onlyEvCharging: false,
      onlyCovered: false,
      only24Hours: false,
    }));
  };

  const handleOpenFacilityModal = (facility: ParkingFacility, slot?: ParkingSlot) => {
    setSelectedFacilityForModal(facility);
    setSelectedSlotForModal(slot || null);
  };

  const handleBookingComplete = (newBooking: Booking) => {
    setBookings(parkingService.getBookings());
  };

  const handleCancelBooking = (bookingId: string) => {
    parkingService.cancelBooking(bookingId);
    setBookings(parkingService.getBookings());
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      
      {/* Top Real-Time Activity Ticker */}
      <LiveTicker events={liveEvents} />

      {/* Main Sticky Navbar */}
      <Navbar
        activeBookingsCount={activeBookings.length}
        onOpenBookings={() => setIsBookingsModalOpen(true)}
        totalFacilitiesCount={facilities.length}
        totalAvailableSpots={totalAvailableAcrossCities}
      />

      {/* City Hero & Real-Time Stats Header */}
      <CityStatsHeader
        city={activeCity}
        facilities={facilities.filter((f) => f.cityId === activeCity.id)}
        activeVehicleType={filters.vehicleType}
      />

      {/* Interactive Filters Bar */}
      <FilterBar
        cities={CITIES}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        cityAvailabilityMap={cityAvailabilityMap}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        totalFilteredCount={filteredFacilities.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Results Counter & Active Context */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm sm:text-base font-bold text-slate-900">
              {filteredFacilities.length} Parking {filteredFacilities.length === 1 ? 'Location' : 'Locations'} Available
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Real-time telemetry updated live
            </span>
          </div>

          <div className="text-xs text-slate-600 hidden sm:flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Guaranteed Spot Reservation</span>
          </div>
        </div>

        {/* View Mode: Cards Grid or Interactive Map */}
        {viewMode === 'grid' ? (
          filteredFacilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map((facility) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  activeVehicleType={filters.vehicleType}
                  onSelectFacility={(fac) => handleOpenFacilityModal(fac)}
                  onQuickBook={(fac) => handleOpenFacilityModal(fac)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Parking Garages Found</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                No facilities in {activeCity.name} matched your exact price, vehicle type, or distance filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm shadow-blue-200"
              >
                Reset All Filters
              </button>
            </div>
          )
        ) : (
          <MapView
            city={activeCity}
            facilities={filteredFacilities}
            activeVehicleType={filters.vehicleType}
            onSelectFacility={(fac) => handleOpenFacilityModal(fac)}
            onQuickBook={(fac) => handleOpenFacilityModal(fac)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">ParkHub</span>
            <span className="text-slate-300">|</span>
            <span>Enterprise Real-Time Urban Parking Availability & Reservation</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>Cities: New York • San Francisco • Chicago • Seattle</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Live Feed Active
            </span>
          </div>
        </div>
      </footer>

      {/* Interactive Slot Floor Layout & Reservation Modal */}
      {selectedFacilityForModal && (
        <SlotVisualizerModal
          facility={selectedFacilityForModal}
          initialSelectedSlot={selectedSlotForModal}
          onClose={() => {
            setSelectedFacilityForModal(null);
            setSelectedSlotForModal(null);
          }}
          onBookingComplete={handleBookingComplete}
        />
      )}

      {/* My Bookings / Passes Modal */}
      <MyBookingsModal
        isOpen={isBookingsModalOpen}
        onClose={() => setIsBookingsModalOpen(false)}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
      />

    </div>
  );
}
