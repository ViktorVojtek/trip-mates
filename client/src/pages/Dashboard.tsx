import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import TripCard from '../components/TripCard';
import FilterBar from '../components/FilterBar';
import { getTrips } from '../services/api';
import type { Trip, TripFilters } from '../types';

export default function Dashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TripFilters>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTrips = useCallback(
    async (currentFilters: TripFilters, currentPage: number) => {
      try {
        setLoading(true);
        setError(null);
        const result = await getTrips({ ...currentFilters, page: currentPage });
        setTrips(result.results);
        setTotalPages(result.meta.totalPages);
      } catch {
        setError('Failed to load trips. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchTrips(filters, page);
  }, [fetchTrips, filters, page]);

  const handleFilter = (newFilters: TripFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Trip Feed</h1>
          <p className="text-gray-500 text-sm mt-0.5">Discover travel companions</p>
        </div>
        <Link
          to="/post-trip"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold transition"
        >
          + Post a Trip
        </Link>
      </div>

      <FilterBar onFilter={handleFilter} />

      <div className="mt-6">
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading trips...</div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 mb-3">{error}</p>
            <button
              onClick={() => void fetchTrips(filters, page)}
              className="text-blue-600 hover:underline text-sm"
            >
              Try again
            </button>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="mb-2">No trips found matching your filters.</p>
            <Link to="/post-trip" className="text-blue-600 hover:underline text-sm">
              Be the first to post one!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}

        {totalPages > 1 && !loading && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
