'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FilterOption {
  value: number;
  label: string;
}

interface EventsFilterProps {
  regions: FilterOption[];
}

export function EventsFilter({ regions }: EventsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const regionId = searchParams.get('regionId');
  const searchQuery = searchParams.get('search') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const surface = searchParams.get('surface') || '';

  // Local state for search input (for debouncing)
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Distance range (0-100+ km)
  const [distanceRange, setDistanceRange] = useState<number[]>([
    Number(searchParams.get('minDistance')) || 0,
    Number(searchParams.get('maxDistance')) || 100,
  ]);

  // Elevation range (0-3000+ m)
  const [elevationRange, setElevationRange] = useState<number[]>([
    Number(searchParams.get('minElevation')) || 0,
    Number(searchParams.get('maxElevation')) || 3000,
  ]);

  // Sync search input with URL params when they change externally (e.g., clear filters)
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter('search', searchInput || null);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    params.delete('page');

    router.push(`/events?${params.toString()}`);
  };

  const updateMultipleFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.delete('page');

    router.push(`/events?${params.toString()}`);
  };

  const handleDistanceChange = (values: number[]) => {
    setDistanceRange(values);
  };

  const handleElevationChange = (values: number[]) => {
    setElevationRange(values);
  };

  // Apply distance filter when user releases slider
  const applyDistanceFilter = () => {
    updateMultipleFilters({
      minDistance: distanceRange[0] > 0 ? distanceRange[0].toString() : null,
      maxDistance: distanceRange[1] < 100 ? distanceRange[1].toString() : null,
    });
  };

  // Apply elevation filter when user releases slider
  const applyElevationFilter = () => {
    updateMultipleFilters({
      minElevation: elevationRange[0] > 0 ? elevationRange[0].toString() : null,
      maxElevation: elevationRange[1] < 3000 ? elevationRange[1].toString() : null,
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    setDistanceRange([0, 100]);
    setElevationRange([0, 3000]);
    router.push('/events');
  };

  const hasActiveFilters =
    regionId || searchInput || startDate || endDate || surface ||
    distanceRange[0] > 0 || distanceRange[1] < 100 ||
    elevationRange[0] > 0 || elevationRange[1] < 3000;

  return (
    <div className="h-full">
      <div className="sticky top-4 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Event name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Region Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Region</label>
          <Select
            value={regionId || 'all'}
            onValueChange={(value) => updateFilter('regionId', value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value.toString()}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Surface Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Surface</label>
          <Select
            value={surface || 'all'}
            onValueChange={(value) => updateFilter('surface', value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All surfaces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All surfaces</SelectItem>
              <SelectItem value="asphalt">Asphalt</SelectItem>
              <SelectItem value="trail">Trail</SelectItem>
              <SelectItem value="cobblestone">Cobblestone</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="space-y-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => updateFilter('startDate', e.target.value || null)}
              placeholder="From"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => updateFilter('endDate', e.target.value || null)}
              placeholder="To"
            />
          </div>
        </div>

        {/* Distance Range Slider */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Distance</label>
            <div className="text-xs text-muted-foreground">
              {distanceRange[0]} - {distanceRange[1] === 100 ? '100+' : distanceRange[1]} km
            </div>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={distanceRange}
            onValueChange={handleDistanceChange}
            onValueCommit={applyDistanceFilter}
            className="w-full"
          />
        </div>

        {/* Elevation Range Slider */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Elevation Gain</label>
            <div className="text-xs text-muted-foreground">
              {elevationRange[0]} - {elevationRange[1] === 3000 ? '3000+' : elevationRange[1]} m
            </div>
          </div>
          <Slider
            min={0}
            max={3000}
            step={50}
            value={elevationRange}
            onValueChange={handleElevationChange}
            onValueCommit={applyElevationFilter}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
