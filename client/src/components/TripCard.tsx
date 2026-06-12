import { Link } from 'react-router-dom';
import type { Trip } from '../types';
import { formatDate, truncateText, groupTypeLabel } from '../utils/helpers';

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  const durationDays = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition p-5 group"
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition leading-snug">
          {trip.title}
        </h3>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
          {groupTypeLabel(trip.groupType)}
        </span>
      </div>

      <p className="text-blue-600 font-medium text-sm mb-2">{trip.destination}</p>

      <p className="text-gray-600 text-sm mb-3 leading-relaxed">
        {truncateText(trip.description, 100)}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
        </span>
        <span className="text-gray-400">{durationDays}d</span>
      </div>

      {trip.budget > 0 && (
        <p className="text-gray-600 text-sm mt-2 font-medium">
          Budget: ${trip.budget.toLocaleString()}
        </p>
      )}

      {trip.activityPref && (
        <div className="mt-3 flex flex-wrap gap-1">
          {trip.activityPref
            .split(',')
            .slice(0, 3)
            .map((a) => (
              <span
                key={a}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                {a.trim()}
              </span>
            ))}
        </div>
      )}
    </Link>
  );
}
