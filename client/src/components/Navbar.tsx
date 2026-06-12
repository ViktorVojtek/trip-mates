import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-xl font-bold text-blue-600">
            TripMates
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm text-gray-600 hover:text-blue-600 transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/post-trip"
                  className="text-sm text-gray-600 hover:text-blue-600 transition"
                >
                  Post Trip
                </Link>
                <Link
                  to="/chat"
                  className="text-sm text-gray-600 hover:text-blue-600 transition"
                >
                  Messages
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {getInitials(user.name)}
                    </span>
                  )}
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-blue-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-600 hover:text-gray-800"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="text-2xl leading-none">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-gray-700"
              >
                Dashboard
              </Link>
              <Link
                to="/post-trip"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-gray-700"
              >
                Post Trip
              </Link>
              <Link
                to="/chat"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-gray-700"
              >
                Messages
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-gray-700"
              >
                Profile
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="block py-2 text-sm text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-gray-700"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-blue-600 font-medium"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
