import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { onIdTokenChanged } from 'firebase/auth';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import { useContent } from '../../hooks/useContent';
import {
  adminAuth,
  formatAdminDisplayName,
  isPasswordAuthenticatedUser,
  sendAdminPasswordReset,
  signInAdminWithEmailPassword,
  signOutAdminAuth,
} from '../../services/gmailAuth';
import { apiUrl } from '../../utils/api';

export interface AdminOutletContext {
  adminToken: string;
  adminUsername: string;
  authenticated: boolean;
  staticMode: boolean;
  setHeaderMeta: (meta: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
  }) => void;
}

export const AdminLayout: React.FC = () => {
  const { store, loading } = useContent();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [staticMode, setStaticMode] = useState(true);
  const [headerMeta, setHeaderMeta] = useState<{
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
  }>({
    title: 'CandyGame Admin',
    subtitle: 'Studio Content & Catalog Management',
  });

  useEffect(() => {
    let active = true;

    fetch(apiUrl('/api/health'))
      .then(async (res) => {
        if (!active) return;
        const contentType = res.headers.get('content-type') || '';
        setStaticMode(!(res.ok && contentType.includes('application/json')));
      })
      .catch(() => {
        if (!active) return;
        setStaticMode(true);
      });

    const unsubscribe = onIdTokenChanged(adminAuth, async (user) => {
      if (!active) return;
      if (isPasswordAuthenticatedUser(user) && user) {
        try {
          const token = await user.getIdToken();
          if (!active) return;
          setAdminToken(token);
          setAdminUsername(formatAdminDisplayName(user));
          setAuthenticated(true);
        } catch {
          if (!active) return;
          setAdminToken('');
          setAdminUsername('');
          setAuthenticated(false);
        }
      } else {
        setAdminToken('');
        setAdminUsername('');
        setAuthenticated(false);
      }
      setCheckingSession(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (loading || !store || checkingSession) {
    return (
      <div className="min-h-screen bg-[#151123] flex items-center justify-center text-[#cbc3d6] text-sm">
        Loading CandyGame Admin...
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthNotice('');

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setAuthError('Please enter your email or username and password.');
      return;
    }

    setSigningIn(true);
    try {
      const user = await signInAdminWithEmailPassword(trimmedUser, password);
      const token = await user.getIdToken();
      setAdminToken(token);
      setAdminUsername(formatAdminDisplayName(user));
      setAuthenticated(true);
      setPassword('');
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/operation-not-allowed') {
        setAuthError(
          'Email/Password sign-in must be enabled in Firebase Console (Authentication -> Sign-in method -> Email/Password).'
        );
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError(
          `Add ${window.location.hostname} to Firebase Console -> Authentication -> Settings -> Authorized domains.`
        );
      } else if (code === 'auth/too-many-requests') {
        setAuthError(
          'Too many failed attempts. Please wait a moment and try again.'
        );
      } else {
        setAuthError('Invalid email/username or password. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handlePasswordReset = async () => {
    setAuthError('');
    setAuthNotice('');
    const trimmedUser = username.trim();
    if (!trimmedUser || !trimmedUser.includes('@')) {
      setAuthError('Enter your email address above first to receive a password reset link.');
      return;
    }
    setResettingPassword(true);
    try {
      await sendAdminPasswordReset(trimmedUser);
      setAuthNotice(`Password reset link sent to ${trimmedUser}.`);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/operation-not-allowed') {
        setAuthError(
          'Email/Password sign-in must be enabled in Firebase Console first.'
        );
      } else {
        setAuthError('Unable to send password reset email. Please verify your email address.');
      }
    } finally {
      setResettingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOutAdminAuth().catch(() => {});
    setAuthenticated(false);
    setAdminToken('');
    setAdminUsername('');
    setUsername('');
    setPassword('');
    setAuthError('');
    setAuthNotice('');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#151123] text-[#e7defa] flex items-center justify-center p-6 relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full opacity-25 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(118,82,214,0.65) 0%, rgba(21,17,35,0) 70%)',
          }}
        />
        <div className="relative z-10 w-full max-w-md candy-glass-card rounded-[2rem] p-7 sm:p-9 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <BrandLogo />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7652D6]/20 border border-[#BDA7FF]/25 text-xs font-semibold text-[#cebdff]">
              <Lock size={13} />
              <span>Private Admin Area</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              Admin Panel Sign In
            </h1>
            <p className="text-sm text-[#cbc3d6]">
              Sign in with your administrator email or username and password.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <FormInput
              label="Email or Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter email or username"
              autoComplete="username"
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="admin-password-input"
                  className="block text-sm font-medium text-[#e7defa]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => void handlePasswordReset()}
                  disabled={resettingPassword}
                  className="text-xs font-medium text-[#cebdff] hover:text-white transition-colors cursor-pointer"
                >
                  {resettingPassword ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-2xl bg-[#151123] border border-[#BDA7FF]/20 pl-4 pr-11 py-2.5 text-sm text-[#e7defa] placeholder-[#948e9f] focus:outline-none focus:border-[#BDA7FF] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#948e9f] hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authError ? (
              <p className="text-sm text-[#ffb4ab]" role="alert">
                {authError}
              </p>
            ) : null}

            {authNotice ? (
              <p className="text-sm text-emerald-300" role="status">
                {authNotice}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={signingIn}
              className="w-full"
            >
              {signingIn ? 'Signing In...' : 'Sign In to Admin Panel'}
            </Button>
          </form>

          <div className="pt-2 border-t border-white/10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#cebdff] hover:text-white transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Return to CandyGame Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#151123] text-[#e7defa]">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onSignOut={handleSignOut}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader
          title={headerMeta.title}
          subtitle={headerMeta.subtitle}
          action={headerMeta.action}
          onOpenSidebar={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet
            context={
              {
                adminToken,
                adminUsername,
                authenticated,
                staticMode,
                setHeaderMeta,
              } satisfies AdminOutletContext
            }
          />
        </main>
      </div>
    </div>
  );
};
