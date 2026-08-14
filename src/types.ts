export type VehicleType = 'all' | 'compact' | 'suv' | 'ev' | 'motorcycle' | 'accessible';

export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  centerCoords: { lat: number; lng: number };
  landmark: string;
  tagline: string;
  totalFacilities: number;
}

export interface ParkingSlot {
  id: string;
  bayCode: string;
  floor: number;
  vehicleType: 'compact' | 'suv' | 'ev' | 'motorcycle' | 'accessible';
  isOccupied: boolean;
  isReserved: boolean;
  isEvCharger: boolean;
  chargerSpeedKw?: number;
  occupiedCarModel?: string;
  rateMultiplier?: number;
}

export interface ParkingFacility {
  id: string;
  name: string;
  cityId: string;
  neighborhood: string;
  address: string;
  coordinates: { lat: number; lng: number };
  distanceMiles: number;
  walkingTimeMinutes: number;
  hourlyRate: number;
  dailyRate: number;
  rating: number;
  reviewsCount: number;
  totalSlots: number;
  availableSlots: number;
  evSlotsTotal: number;
  evSlotsAvailable: number;
  accessibleSlotsTotal: number;
  accessibleSlotsAvailable: number;
  motorcycleSlotsTotal: number;
  motorcycleSlotsAvailable: number;
  supportedVehicleTypes: ('compact' | 'suv' | 'ev' | 'motorcycle' | 'accessible')[];
  features: string[];
  imageUrl: string;
  floors: number;
  slots: ParkingSlot[];
  heightLimitMeters: number;
  isCovered: boolean;
  hasSecurityGuard: boolean;
  isOpen24Hours: boolean;
  occupancyTrend: 'rising' | 'stable' | 'dropping';
  lastUpdatedSecondsAgo: number;
}

export type SortOption =
  | 'price-asc'
  | 'price-desc'
  | 'distance-asc'
  | 'availability-desc'
  | 'rating-desc';

export interface FilterOptions {
  selectedCity: string;
  vehicleType: VehicleType;
  maxPrice: number;
  maxDistance: number;
  searchQuery: string;
  sortBy: SortOption;
  onlyAvailable: boolean;
  onlyEvCharging: boolean;
  onlyCovered: boolean;
  only24Hours: boolean;
}

export interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  cityId: string;
  cityName: string;
  slotId: string;
  slotBayCode: string;
  floor: number;
  vehicleType: string;
  licensePlate: string;
  vehicleModel: string;
  startTime: string;
  durationHours: number;
  hourlyRate: number;
  totalPaid: number;
  qrPassCode: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface LiveActivityEvent {
  id: string;
  facilityId: string;
  facilityName: string;
  cityName: string;
  type: 'entry' | 'exit' | 'reserved';
  vehicleDescription: string;
  slotCode: string;
  timestamp: string;
  agoText: string;
}
