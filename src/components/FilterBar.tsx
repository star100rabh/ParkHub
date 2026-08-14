import React from 'react';
import {
  Search,
  SlidersHorizontal,
  DollarSign,
  Navigation,
  Car,
  Zap,
  Accessibility,
  Bike,
  Building2,
  ArrowUpDown,
  RotateCcw,
  ShieldCheck,
  Umbrella,
  Clock,
  Sparkles,
  LayoutGrid,
  Map as MapIcon,
} from 'lucide-react';
import { City, FilterOptions, SortOption, VehicleType } from '../types';

interface FilterBarProps {
  cities: City[];
  filters: FilterOptions;
  onFilterChange: (newFilters: Partial<FilterOptions>) => void;
  onResetFilters: () => void;
  cityAvailabilityMap: Record<string, { available: number; total: number }>;
  viewMode: 'grid' | 'map';
  onToggleViewMode: (mode: 'grid' | 'map') => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  cities,
  filters,
  onFilterChange,
  onResetFilters,
  cityAvailabilityMap,
  viewMode,
  onToggleViewMode,
  totalFilteredCount,
}) => {
  const vehicleTypes: { id: VehicleType; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Vehicles', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'compact', label: 'Sedan / SUV', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'suv', label: 'Large Truck', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'ev', label: 'EV Charging', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'motorcycle', label: 'Motorcycle', icon: <Bike className="w-3.5 h-3.5" /> },
    { id: 'accessible', label: 'Accessible', icon: <Accessibility className="w-3.5 h-3.5" /> },
  ];

  const pricePresets = [
    { label: 'Any Price', val: 25 },
    { label: '< $8/hr', val: 8 },
    { label: '< $12/hr', val: 12 },
    { label: '< $15/hr', val: 15 },
  ];

  const distancePresets = [
    { label: 'Any Dist', val: 5 },
    { label: '< 0.5 mi', val: 0.5 },
    { label: '< 1.0 mi', val: 1.0 },
    { label: '< 2.0 mi', val: 2.0 },
  ];

  const isFiltered =
    filters.vehicleType !== 'all' ||
    filters.maxPrice < 25 ||
    filters.maxDistance < 5 ||
    filters.searchQuery.trim() !== '' ||
    filters.onlyAvailable ||
    filters.onlyEvCharging ||
    filters.onlyCovered ||
    filters.only24Hours;

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Row 1: City Selection Bar & View Mode */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
              Metro:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((city) => {
                const isSelected = filters.selectedCity === city.id;
                const stats = cityAvailabilityMap[city.id] || { available: 0, total: 0 };
                return (
                  <button
                    key={city.id}
                    id={`city-tab-${city.id}`}
                    onClick={() => onFilterChange({ selectedCity: city.id })}
                    className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 ring-1 ring-blue-600'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span>{city.name}</span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isSelected
                          ? 'bg-blue-700 text-white'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {stats.available} open
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Mode Switcher (List Grid / Interactive City Map) */}
          <div className="flex items-center self-end md:self-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">View:</span>
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
              <button
                id="view-mode-grid"
                onClick={() => onToggleViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                id="view-mode-map"
                onClick={() => onToggleViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Search Bar & Primary Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-3.5 items-center">
          
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-facilities-input"
              type="text"
              placeholder="Search garage, landmark, or street..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900"
            />
          </div>

          {/* Quick Price Range */}
          <div className="lg:col-span-4 flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap flex items-center">
              <DollarSign className="w-3.5 h-3.5 text-slate-400 mr-0.5" /> Price:
            </span>
            <div className="flex flex-wrap gap-1">
              {pricePresets.map((preset) => (
                <button
                  key={preset.label}
                  id={`price-preset-${preset.val}`}
                  onClick={() => onFilterChange({ maxPrice: preset.val })}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    filters.maxPrice === preset.val
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="lg:col-span-4 flex items-center justify-start lg:justify-end space-x-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-1" /> Sort:
            </span>
            <select
              id="sort-select-dropdown"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
              aria-label="Sort parking facilities"
              className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="price-asc">Price: Lowest First</option>
              <option value="price-desc">Price: Highest First</option>
              <option value="distance-asc">Distance: Nearest First</option>
              <option value="availability-desc">Availability: Most Free First</option>
              <option value="rating-desc">Rating: Highest First</option>
            </select>

            {isFiltered && (
              <button
                id="reset-filters-btn"
                onClick={onResetFilters}
                title="Reset all filters"
                className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Vehicle Type Selection & Quick Badges */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* Vehicle Type Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Vehicle:
            </span>
            <div className="flex items-center gap-1.5">
              {vehicleTypes.map((v) => {
                const isSelected = filters.vehicleType === v.id;
                return (
                  <button
                    key={v.id}
                    id={`vehicle-filter-${v.id}`}
                    onClick={() => onFilterChange({ vehicleType: v.id })}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {v.icon}
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Feature Toggles */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            <button
              id="toggle-only-available"
              onClick={() => onFilterChange({ onlyAvailable: !filters.onlyAvailable })}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded border transition-all cursor-pointer text-xs font-semibold ${
                filters.onlyAvailable
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${filters.onlyAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              <span>Available Only</span>
            </button>

            <button
              id="toggle-ev-fast"
              onClick={() => onFilterChange({ onlyEvCharging: !filters.onlyEvCharging })}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded border transition-all cursor-pointer text-xs font-semibold ${
                filters.onlyEvCharging
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${filters.onlyEvCharging ? 'text-amber-600 fill-amber-600' : 'text-slate-400'}`} />
              <span>EV Fast Charger</span>
            </button>

            <button
              id="toggle-covered"
              onClick={() => onFilterChange({ onlyCovered: !filters.onlyCovered })}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded border transition-all cursor-pointer text-xs font-semibold ${
                filters.onlyCovered
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Umbrella className={`w-3.5 h-3.5 ${filters.onlyCovered ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Covered</span>
            </button>

            <button
              id="toggle-24-hours"
              onClick={() => onFilterChange({ only24Hours: !filters.only24Hours })}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded border transition-all cursor-pointer text-xs font-semibold ${
                filters.only24Hours
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${filters.only24Hours ? 'text-white' : 'text-slate-400'}`} />
              <span>24/7 Access</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
