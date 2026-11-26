import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import { useContent } from '../../hooks/useContent';
import {
  disconnectGmail,
  firebaseAuth,
  isAuthorizedOwner,
  signInOwnerWithGoogle,
} from '../../services/gmailAuth';

export interface AdminOutletContext {
  adminToken: string;
  adminUsername: string;
  authenticated: boolean;
  staticMode: boolean;
  updateAdminAuth: (next: { token: string; username: string }) => void;
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
  const [authError, setAuthError] = useState('');
  const [staticMode, setStaticMode] = useState(false);
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
    let unsubscribeFirebase: (() => void) | null = null;

    const subscribeStaticOwnerAuth = () => {
      setStaticMode(true);
      unsubscribeFirebase = onAuthStateChanged(firebaseAuth, async (user) => {
        if (!active) return;
        if (isAuthorizedOwner(user)) {
          setAuthenticated(true);
          setAdminUsername(user?.displayName || user?.email || 'Studio Owner');
        } else {
          if (user) {
            await firebaseAuth.signOut().catch(() => {});
          }
          setAuthenticated(false);
          setAdminUsername('');
        }
        setCheckingSession(false);
      });
    };

    fetch('/api/admin/session', {
      credentials: 'same-origin',
    })
      .then(async (res) => {
        if (!active) return;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          subscribeStaticOwnerAuth();
          return;
        }
        setStaticMode(false);
        if (res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            authenticated?: boolean;
            username?: string;
          };
          if (data.authenticated) {
            setAuthenticated(true);
            setAdminUsername(data.username || '');
          }
        }
        setCheckingSession(false);
      })
      .catch(() => {
        if (!active) return;
        subscribeStaticOwnerAuth();
      });

    return () => {
      active = false;
      unsubscribeFirebase?.();
    };
  }, []);

  if (loading || !store || checkingSession) {
    return (
      <div className="min-h-screen bg-[#151123] flex items-center justify-center text-[#cbc3d6] text-sm">
        Loading CandyGame Admin...
      </div>
    );
  }

  const handleServerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSigningIn(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'CandyGameAdmin',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          useCookie: true,
        }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setStaticMode(true);
        setAuthError(
          'Static hosting detected. Please sign in with your authorized Google account below.'
        );
        return;
      }
      const payload = (await response.json().catch(() => ({}))) as {
        token?: string;
        username?: string;
        error?: string;
      };

      if (!response.ok || !payload.token) {
        setAuthError(
          payload.error || 'Invalid username or password. Please try again.'
        );
        return;
      }

      setAdminToken(payload.token);
      setAdminUsername(payload.username || username.trim());
      setAuthenticated(true);
      setPassword('');
    } catch {
      setAuthError('Unable to reach authentication server. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleStaticOwnerGoogleSignIn = async () => {
    setAuthError('');
    setSigningIn(true);
    try {
      const user = await signInOwnerWithGoogle();
      setAdminUsername(user.displayName || user.email || 'Studio Owner');
      setAuthenticated(true);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/unauthorized-domain') {
        setAuthError(
          `This domain (${window.location.hostname}) must be added to Firebase Authentication -> Settings -> Authorized domains.`
        );
      } else {
        setAuthError(
          err instanceof Error && err.message
            ? err.message
            : 'Google sign-in failed or was cancelled.'
        );
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (staticMode) {
      await disconnectGmail().catch(() => {});
    } else {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'X-Requested-With': 'CandyGameAdmin',
          },
        });
      } catch {
        // Ignore network errors on sign out
      }
    }
    setAuthenticated(false);
    setAdminToken('');
    setAdminUsername('');
    setUsername('');
    setPassword('');
    setAuthError('');
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
              {staticMode
                ? 'Sign in with your private studio owner Google account to access the CandyGame Admin Panel.'
                : 'Enter your private administrator username and password to access CandyGame management tools.'}
            </p>
          </div>

          {staticMode ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => void handleStaticOwnerGoogleSignIn()}
                disabled={signingIn}
                className="gsi-material-button w-full!"
                style={{ width: '100%', maxWidth: '100%' }}
              >
                <div className="gsi-material-button-state" />
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {signingIn ? 'Verifying...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>

              {authError ? (
                <p className="text-sm text-[#ffb4ab] text-center" role="alert">
                  {authError}
                </p>
              ) : null}

              <p className="text-xs text-[#948e9f] text-center leading-relaxed">
                Restricted to the authorized studio owner account. Username &amp; password authentication also runs when hosted on the Node.js server.
              </p>
            </div>
          ) : (
            <form onSubmit={handleServerSignIn} className="space-y-4">
              <FormInput
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="admin-password-input"
                  className="block text-sm font-medium text-[#e7defa]"
                >
                  Password
                </label>
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
          )}

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
                updateAdminAuth: ({ token, username: nextUser }) => {
                  setAdminToken(token);
                  setAdminUsername(nextUser);
                  setAuthenticated(true);
                },
                setHeaderMeta,
              } satisfies AdminOutletContext
            }
          />
        </main>
      </div>
    </div>
  );
};
