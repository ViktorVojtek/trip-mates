import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Renders the Google sign-in button. Returns null when VITE_GOOGLE_CLIENT_ID is
 * not configured, so the app works without Google credentials.
 */
export default function GoogleAuthButton() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const clientId = import.meta.env['VITE_GOOGLE_CLIENT_ID'];

  if (!clientId) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <GoogleLogin
        onSuccess={(cred) => {
          if (!cred.credential) return;
          void loginWithGoogle(cred.credential).then(() => navigate('/dashboard'));
        }}
        onError={() => {
          /* user dismissed or Google error — no-op */
        }}
      />
    </div>
  );
}
