import { useState, useRef } from 'react';
import type { TripFilters } from '../types';

interface FilterBarProps {
  onFilter: (filters: TripFilters) => void;
}

export default function FilterBar({ onFilter }: FilterBarProps) {
  const [filters, setFilters] = useState<TripFilters>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = (key: keyof TripFilters, value: string) => {
    const updated: TripFilters = { ...filters, [key]: value || undefined };
    setFilters(updated);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onFilter(updated), 400);
  };

  const handleReset = () => {
    setFilters({});
    onFilter({});
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Destination</label>
          <input
            type="text"
            value={filters.destination ?? ''}
            placeholder="e.g. Paris, Italy..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => update('destination', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Group Type</label>
          <select
            value={filters.groupType ?? ''}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            onChange={(e) => update('groupType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="family">Families</option>
            <option value="couples">Couples</option>
            <option value="solo">Solo Travelers</option>
            <option value="friends">Friends Group</option>
            <option value="mixed">Mixed Group</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Start From</label>
          <input
            type="date"
            value={filters.startDate ?? ''}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => update('startDate', e.target.value)}
          />
        </div>

        {hasFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline py-2"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
