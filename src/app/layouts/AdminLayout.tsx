import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import { useContent } from '../../hooks/useContent';

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
  const [backendAvailable, setBackendAvailable] = useState(true);
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
    fetch('/api/admin/session', {
      credentials: 'same-origin',
    })
      .then(async (res) => {
        if (!active) return;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          setBackendAvailable(false);
          setStaticMode(true);
          setAuthenticated(true);
          setAdminUsername('Public Admin');
          return;
        }
        setBackendAvailable(true);
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
      })
      .catch(() => {
        if (!active) return;
        setBackendAvailable(false);
        setStaticMode(true);
        setAuthenticated(true);
        setAdminUsername('Public Admin');
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
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
        setBackendAvailable(false);
        setAuthError(
          'Admin authentication requires running the Node.js server (static hosting like GitHub Pages serves public pages only).'
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

  const handleSignOut = async () => {
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
              <span>Protected Admin Area</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              Admin Panel Sign In
            </h1>
            <p className="text-sm text-[#cbc3d6]">
              Enter your studio administrator username and password to access CandyGame management tools.
            </p>
          </div>

          {!backendAvailable ? (
            <div className="rounded-2xl bg-[#151123] border border-[#BDA7FF]/25 p-3.5 text-xs text-[#cbc3d6] leading-relaxed">
              Static hosting mode detected (such as GitHub Pages). Public website pages work normally, while protected Admin login and server inbox APIs require running the Node.js server.
            </div>
          ) : null}

          <form onSubmit={handleSignIn} className="space-y-4">
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
        onSignOut={staticMode ? undefined : handleSignOut}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader
          title={headerMeta.title}
          subtitle={headerMeta.subtitle}
          action={headerMeta.action}
          onOpenSidebar={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
          {staticMode ? (
            <div className="mb-6 rounded-2xl bg-[#1F1A35] border border-[#BDA7FF]/25 px-4 py-3 text-xs text-[#cbc3d6] flex flex-wrap items-center justify-between gap-2">
              <span>
                Static Hosting Mode (GitHub Pages): Admin panel access is open in your browser and edits save locally.
              </span>
              <span className="text-[#cebdff] font-medium">Public Browser Mode</span>
            </div>
          ) : null}
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
