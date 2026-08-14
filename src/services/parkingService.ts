import { Booking, FilterOptions, LiveActivityEvent, ParkingFacility, ParkingSlot, VehicleType } from '../types';
import { CITIES, INITIAL_FACILITIES } from '../data/mockData';

const LOCAL_STORAGE_BOOKINGS_KEY = 'parkhub_user_bookings_v1';

class ParkingApiService {
  private facilities: ParkingFacility[] = JSON.parse(JSON.stringify(INITIAL_FACILITIES));
  private subscribers: Set<(facilities: ParkingFacility[]) => void> = new Set();
  private eventSubscribers: Set<(event: LiveActivityEvent) => void> = new Set();
  private tickerInterval: any = null;
  private recentEvents: LiveActivityEvent[] = [
    {
      id: 'init-1',
      facilityId: 'nyc-midtown-central',
      facilityName: 'Midtown Central Smart Garage',
      cityName: 'New York',
      type: 'entry',
      vehicleDescription: 'Tesla Model 3',
      slotCode: 'A-04 (EV Fast)',
      timestamp: new Date(Date.now() - 15000).toISOString(),
      agoText: '15s ago',
    },
    {
      id: 'init-2',
      facilityId: 'sf-soma-tech',
      facilityName: 'SoMa Innovation EV Multi-Level',
      cityName: 'San Francisco',
      type: 'exit',
      vehicleDescription: 'Honda Civic',
      slotCode: 'B-12',
      timestamp: new Date(Date.now() - 45000).toISOString(),
      agoText: '45s ago',
    },
    {
      id: 'init-3',
      facilityId: 'chi-millennium-park',
      facilityName: 'Millennium Park Grand Underground',
      cityName: 'Chicago',
      type: 'reserved',
      vehicleDescription: 'BMW i4',
      slotCode: 'C-08 (EV)',
      timestamp: new Date(Date.now() - 85000).toISOString(),
      agoText: '1m ago',
    },
  ];

  constructor() {
    this.startRealtimeSimulation();
  }

  public subscribe(callback: (facilities: ParkingFacility[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.getFacilitiesSnapshot());
    return () => this.subscribers.delete(callback);
  }

  public subscribeEvents(callback: (event: LiveActivityEvent) => void): () => void {
    this.eventSubscribers.add(callback);
    return () => this.eventSubscribers.delete(callback);
  }

  public getRecentEvents(): LiveActivityEvent[] {
    return [...this.recentEvents];
  }

  public getFacilitiesSnapshot(): ParkingFacility[] {
    return JSON.parse(JSON.stringify(this.facilities));
  }

  public async fetchFacilities(filters: FilterOptions): Promise<{ facilities: ParkingFacility[]; totalCount: number }> {
    // Simulated network delay for realistic API behavior (120ms)
    await new Promise((resolve) => setTimeout(resolve, 120));

    let results = this.getFacilitiesSnapshot().filter((facility) => {
      // 1. City Filter
      if (filters.selectedCity && facility.cityId !== filters.selectedCity) {
        return false;
      }

      // 2. Vehicle Type filter
      if (filters.vehicleType !== 'all') {
        const hasSlotForType = facility.slots.some(
          (s) => s.vehicleType === filters.vehicleType && (!filters.onlyAvailable || !s.isOccupied)
        );
        if (!hasSlotForType) return false;
      }

      // 3. Price filter
      if (filters.maxPrice && facility.hourlyRate > filters.maxPrice) {
        return false;
      }

      // 4. Distance filter
      if (filters.maxDistance && facility.distanceMiles > filters.maxDistance) {
        return false;
      }

      // 5. Only Available
      if (filters.onlyAvailable && facility.availableSlots <= 0) {
        return false;
      }

      // 6. EV Charging requirement
      if (filters.onlyEvCharging && facility.evSlotsAvailable <= 0) {
        return false;
      }

      // 7. Covered Parking requirement
      if (filters.onlyCovered && !facility.isCovered) {
        return false;
      }

      // 8. 24 Hours requirement
      if (filters.only24Hours && !facility.isOpen24Hours) {
        return false;
      }

      // 9. Search Query
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

    // Apply Sorting
    results.sort((a, b) => {
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

    return {
      facilities: results,
      totalCount: results.length,
    };
  }

  public getFacilityById(id: string): ParkingFacility | undefined {
    return this.facilities.find((f) => f.id === id);
  }

  public async reserveSlot(params: {
    facilityId: string;
    slotId: string;
    vehicleType: string;
    licensePlate: string;
    vehicleModel: string;
    durationHours: number;
    userEmail?: string;
  }): Promise<Booking> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const facility = this.facilities.find((f) => f.id === params.facilityId);
    if (!facility) throw new Error('Parking facility not found');

    const slot = facility.slots.find((s) => s.id === params.slotId);
    if (!slot) throw new Error('Parking slot not found');
    if (slot.isOccupied || slot.isReserved) throw new Error('Slot is no longer available');

    // Mark slot as reserved
    slot.isReserved = true;
    slot.isOccupied = true;
    slot.occupiedCarModel = params.vehicleModel || `${params.vehicleType.toUpperCase()} Vehicle`;
    
    // Recalculate facility slots
    this.recalculateFacilityStats(facility);

    const city = CITIES.find((c) => c.id === facility.cityId);
    const rateMultiplier = slot.rateMultiplier || 1.0;
    const effectiveHourly = facility.hourlyRate * rateMultiplier;
    const totalPaid = Number((effectiveHourly * params.durationHours).toFixed(2));

    const qrPassCode = `PKH-${facility.cityId.toUpperCase()}-${slot.bayCode}-${Date.now().toString(36).toUpperCase()}`;

    const newBooking: Booking = {
      id: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      facilityId: facility.id,
      facilityName: facility.name,
      facilityAddress: facility.address,
      cityId: facility.cityId,
      cityName: city ? city.name : 'Metro',
      slotId: slot.id,
      slotBayCode: slot.bayCode,
      floor: slot.floor,
      vehicleType: params.vehicleType,
      licensePlate: params.licensePlate.toUpperCase(),
      vehicleModel: params.vehicleModel,
      startTime: new Date().toISOString(),
      durationHours: params.durationHours,
      hourlyRate: effectiveHourly,
      totalPaid,
      qrPassCode,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Save to user storage
    this.saveBookingToStorage(newBooking);

    // Emit live event
    const liveEvent: LiveActivityEvent = {
      id: `ev-${Date.now()}`,
      facilityId: facility.id,
      facilityName: facility.name,
      cityName: city ? city.name : 'Metro',
      type: 'reserved',
      vehicleDescription: `${params.vehicleModel || 'Vehicle'} (${params.licensePlate.toUpperCase()})`,
      slotCode: `${slot.bayCode} (Floor ${slot.floor})`,
      timestamp: new Date().toISOString(),
      agoText: 'Just now',
    };
    this.recordLiveEvent(liveEvent);

    // Notify all listeners
    this.notifySubscribers();

    return newBooking;
  }

  public getBookings(): Booking[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public cancelBooking(bookingId: string): boolean {
    const bookings = this.getBookings();
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return false;

    target.status = 'cancelled';
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));

    // Release slot
    const facility = this.facilities.find((f) => f.id === target.facilityId);
    if (facility) {
      const slot = facility.slots.find((s) => s.id === target.slotId);
      if (slot) {
        slot.isOccupied = false;
        slot.isReserved = false;
        slot.occupiedCarModel = undefined;
        this.recalculateFacilityStats(facility);
        this.notifySubscribers();
      }
    }

    return true;
  }

  private saveBookingToStorage(booking: Booking) {
    const current = this.getBookings();
    current.unshift(booking);
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(current));
  }

  private recalculateFacilityStats(facility: ParkingFacility) {
    const total = facility.slots.length;
    const occupied = facility.slots.filter((s) => s.isOccupied).length;
    facility.availableSlots = Math.max(0, total - occupied);

    const evSlots = facility.slots.filter((s) => s.vehicleType === 'ev');
    facility.evSlotsTotal = evSlots.length;
    facility.evSlotsAvailable = evSlots.filter((s) => !s.isOccupied).length;

    const accSlots = facility.slots.filter((s) => s.vehicleType === 'accessible');
    facility.accessibleSlotsTotal = accSlots.length;
    facility.accessibleSlotsAvailable = accSlots.filter((s) => !s.isOccupied).length;

    const motoSlots = facility.slots.filter((s) => s.vehicleType === 'motorcycle');
    facility.motorcycleSlotsTotal = motoSlots.length;
    facility.motorcycleSlotsAvailable = motoSlots.filter((s) => !s.isOccupied).length;

    facility.lastUpdatedSecondsAgo = 0;
  }

  private recordLiveEvent(event: LiveActivityEvent) {
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 20) {
      this.recentEvents.pop();
    }
    this.eventSubscribers.forEach((cb) => cb(event));
  }

  private notifySubscribers() {
    const snapshot = this.getFacilitiesSnapshot();
    this.subscribers.forEach((cb) => cb(snapshot));
  }

  private startRealtimeSimulation() {
    if (this.tickerInterval) clearInterval(this.tickerInterval);

    // Dynamic slot drift every 4.5 seconds
    this.tickerInterval = setInterval(() => {
      if (this.facilities.length === 0) return;

      const randomFacilityIndex = Math.floor(Math.random() * this.facilities.length);
      const facility = this.facilities[randomFacilityIndex];
      if (!facility || facility.slots.length === 0) return;

      const randomSlotIndex = Math.floor(Math.random() * facility.slots.length);
      const slot = facility.slots[randomSlotIndex];

      // Do not randomly kick out a user-reserved slot
      if (slot.isReserved) return;

      const action = slot.isOccupied ? 'exit' : 'entry';
      const city = CITIES.find((c) => c.id === facility.cityId);

      if (action === 'entry') {
        slot.isOccupied = true;
        const models = ['Tesla Model 3', 'Ford Bronco', 'Toyota RAV4', 'Hyundai Ioniq', 'Rivian R1T', 'Audi e-tron', 'Porsche Macan'];
        slot.occupiedCarModel = models[Math.floor(Math.random() * models.length)];
      } else {
        slot.isOccupied = false;
        slot.occupiedCarModel = undefined;
      }

      this.recalculateFacilityStats(facility);

      // Create live event
      const event: LiveActivityEvent = {
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        facilityId: facility.id,
        facilityName: facility.name,
        cityName: city ? city.name : 'Metro',
        type: action,
        vehicleDescription: slot.occupiedCarModel || 'Vehicle',
        slotCode: `${slot.bayCode} (${slot.isEvCharger ? 'EV' : slot.vehicleType})`,
        timestamp: new Date().toISOString(),
        agoText: 'Just now',
      };

      this.recordLiveEvent(event);
      this.notifySubscribers();
    }, 4500);
  }
}

export const parkingService = new ParkingApiService();
