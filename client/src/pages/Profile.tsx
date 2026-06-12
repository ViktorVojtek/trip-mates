import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileForm from '../components/ProfileForm';
import { getInitials, formatDate } from '../utils/helpers';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                {getInitials(user.name)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 text-sm font-medium transition flex-shrink-0"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {!editing && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-gray-500 block text-xs mb-0.5">Family Size</span>
              <p className="font-medium text-gray-800">
                {user.familySize} {user.familySize === 1 ? 'person' : 'people'}
              </p>
            </div>
            {user.childrenAges && (
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 block text-xs mb-0.5">Children&apos;s Ages</span>
                <p className="font-medium text-gray-800">{user.childrenAges}</p>
              </div>
            )}
            {user.travelPreferences && (
              <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
                <span className="text-gray-500 block text-xs mb-0.5">Travel Preferences</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.travelPreferences.split(',').map((pref) => (
                    <span
                      key={pref}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                    >
                      {pref.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {user.availability && (
              <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
                <span className="text-gray-500 block text-xs mb-0.5">Availability</span>
                <p className="font-medium text-gray-800">{user.availability}</p>
              </div>
            )}
            {user.bio && (
              <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
                <span className="text-gray-500 block text-xs mb-0.5">Bio</span>
                <p className="text-gray-800 leading-relaxed">{user.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {editing && (
        <ProfileForm
          user={user}
          onSave={async () => {
            await refreshProfile();
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}
