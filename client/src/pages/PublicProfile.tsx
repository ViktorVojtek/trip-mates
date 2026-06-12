import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUser, getTrips } from '../services/api';
import type { User, Trip } from '../types';
import { getInitials, formatDate } from '../utils/helpers';
import TripCard from '../components/TripCard';

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      getUser(userId),
      getTrips({ createdById: userId, pageSize: 50 }),
    ])
      .then(([user, result]) => {
        setProfileUser(user);
        setTrips(result.results.filter((t) => t.createdById === userId));
      })
      .catch(() => setError('User not found.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading profile...</div>;
  }

  if (error || !profileUser) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-3">{error ?? 'User not found.'}</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline text-sm">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const memberSince = new Date(profileUser.createdAt).getFullYear();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0">
            {profileUser.profilePicture ? (
              <img
                src={profileUser.profilePicture}
                alt={profileUser.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                {getInitials(profileUser.name)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{profileUser.name}</h1>
            <p className="text-sm text-gray-400 mb-3">Member since {memberSince}</p>

            {profileUser.bio && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{profileUser.bio}</p>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {profileUser.familySize > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Family size: </span>
                  <span className="text-gray-600">{profileUser.familySize}</span>
                </div>
              )}
              {profileUser.childrenAges && (
                <div>
                  <span className="font-medium text-gray-700">Children&apos;s ages: </span>
                  <span className="text-gray-600">{profileUser.childrenAges}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {profileUser.travelPreferences && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Travel Preferences</h3>
            <div className="flex flex-wrap gap-2">
              {profileUser.travelPreferences.split(',').map((pref) => (
                <span
                  key={pref}
                  className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                >
                  {pref.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {profileUser.availability && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Availability</h3>
            <div className="flex flex-wrap gap-1">
              {profileUser.availability.split(',').map((date) => (
                <span
                  key={date}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  {formatDate(date.trim())}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {trips.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Posted Trips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
