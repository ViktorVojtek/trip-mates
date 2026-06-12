import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTripDetail, expressInterest, getUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Trip, User } from '../types';
import { formatDate, groupTypeLabel } from '../utils/helpers';
import MatchScore from '../components/MatchScore';

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interested, setInterested] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [creator, setCreator] = useState<User | null>(null);

  useEffect(() => {
    if (!id) return;
    getTripDetail(id)
      .then(setTrip)
      .catch(() => setError('Trip not found or unavailable.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!trip?.createdById) return;
    void getUser(trip.createdById).then(setCreator).catch(() => {});
  }, [trip?.createdById]);

  const handleInterest = async () => {
    if (!id) return;
    try {
      setInterestLoading(true);
      await expressInterest(id);
      setInterested(true);
    } catch {
      // already expressed interest, or network error — treat as success
      setInterested(true);
    } finally {
      setInterestLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading trip details...</div>;
  }

  if (error || !trip) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-3">{error ?? 'Trip not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  const isOwner = trip.createdById === user?.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline text-sm mb-5 flex items-center gap-1"
      >
        ← Back to trips
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">{trip.title}</h1>
          <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full whitespace-nowrap ml-3">
            {groupTypeLabel(trip.groupType)}
          </span>
        </div>

        <p className="text-blue-600 font-semibold text-lg mb-2">{trip.destination}</p>

        {creator && (
          <p className="text-sm text-gray-500 mb-4">
            Posted by{' '}
            <Link
              to={`/profile/${creator.id}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {creator.name}
            </Link>
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5">
          <span>
            <span className="font-medium text-gray-700">From:</span> {formatDate(trip.startDate)}
          </span>
          <span>
            <span className="font-medium text-gray-700">To:</span> {formatDate(trip.endDate)}
          </span>
        </div>

        <p className="text-gray-700 leading-relaxed mb-5">{trip.description}</p>

        {trip.activityPref && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Activities</h3>
            <div className="flex flex-wrap gap-2">
              {trip.activityPref.split(',').map((a) => (
                <span
                  key={a}
                  className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                >
                  {a.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {user && (
          <div className="mb-5">
            <MatchScore userPrefs={user.travelPreferences} tripPrefs={trip.activityPref} />
          </div>
        )}

        {isOwner ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            This is your trip posting.
          </div>
        ) : (
          <button
            onClick={() => void handleInterest()}
            disabled={interested || interestLoading}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              interested
                ? 'bg-green-600 text-white cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
            }`}
          >
            {interestLoading ? 'Sending...' : interested ? '✓ Interest Expressed' : 'Express Interest'}
          </button>
        )}
      </div>
    </div>
  );
}
