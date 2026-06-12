import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTrips } from '../services/api';
import type { Trip } from '../types';
import TripCard from '../components/TripCard';

export default function Landing() {
  const { user } = useAuth();
  const [featuredTrips, setFeaturedTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  useEffect(() => {
    getTrips({ pageSize: 3 })
      .then((result) => setFeaturedTrips(result.results))
      .catch(() => {})
      .finally(() => setTripsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold mb-6">Travel Together, Better</h1>
          <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
            Find like-minded families and travelers to share unforgettable adventures. Plan trips,
            split costs, and make lifelong memories.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                desc: 'Tell us about your family, travel style, and when you are available to travel.',
              },
              {
                step: '2',
                title: 'Post or Browse Trips',
                desc: 'Share your trip plans or explore others looking for travel companions.',
              },
              {
                step: '3',
                title: 'Connect & Travel',
                desc: 'Match with compatible travelers and plan your adventure together.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center p-6">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Why TripMates?</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-12">
            Solo travel is great, but sharing experiences with the right people makes them
            extraordinary.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '👨‍👩‍👧‍👦',
                title: 'Family-Friendly',
                desc: 'Designed for families with kids — find others with children the same age.',
              },
              {
                icon: '💰',
                title: 'Split Costs',
                desc: 'Sharing accommodations and transport makes travel more affordable.',
              },
              {
                icon: '🔒',
                title: 'Safe & Verified',
                desc: 'Profiles and messaging keep you in control of who you connect with.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Featured Trips</h2>
            <Link to="/dashboard" className="text-blue-600 hover:underline text-sm font-medium">
              View all trips →
            </Link>
          </div>
          {tripsLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading trips...</div>
          ) : featuredTrips.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No trips posted yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </section>

      {!user && (
        <section className="bg-blue-600 py-16 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to find your travel mates?</h2>
          <p className="text-blue-100 mb-8">Join thousands of families already traveling together.</p>
          <Link
            to="/signup"
            className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Create Free Account
          </Link>
        </section>
      )}

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>© {new Date().getFullYear()} TripMates. All rights reserved.</p>
      </footer>
    </div>
  );
}
