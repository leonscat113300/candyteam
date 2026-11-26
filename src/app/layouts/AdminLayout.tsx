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

const STATIC_CRED_STORAGE_KEY = 'candygame_static_admin_v1';
const STATIC_UNLOCK_SESSION_KEY = 'candygame_static_unlocked_v1';

interface StaticAdminRecord {
  username: string;
  salt: string;
  hash: string;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function deriveStaticHash(password: string, saltHex: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('Secure browser cryptography is required.');
  }
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const saltBytes = hexToBytes(saltHex);
  const saltBuffer = saltBytes.buffer.slice(
    saltBytes.byteOffset,
    saltBytes.byteOffset + saltBytes.byteLength
  ) as ArrayBuffer;
  const derived = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(derived));
}

function readStaticAdminRecord(): StaticAdminRecord | null {
  try {
    const raw = window.localStorage.getItem(STATIC_CRED_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StaticAdminRecord>;
    if (
      typeof parsed.username === 'string' &&
      typeof parsed.salt === 'string' &&
      typeof parsed.hash === 'string' &&
      parsed.username &&
      parsed.salt &&
      parsed.hash
    ) {
      return {
        username: parsed.username,
        salt: parsed.salt,
        hash: parsed.hash,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function updateStaticAdminCredentials(params: {
  currentPassword: string;
  newUsername?: string;
  newPassword?: string;
}): Promise<{ ok: boolean; username?: string; error?: string }> {
  const existing = readStaticAdminRecord();
  if (!existing) {
    return { ok: false, error: 'No static admin credentials configured yet.' };
  }
  const currentHash = await deriveStaticHash(params.currentPassword, existing.salt);
  if (!constantTimeEqual(currentHash, existing.hash)) {
    return { ok: false, error: 'Current password is incorrect.' };
  }
  const nextUsername = params.newUsername?.trim() || existing.username;
  if (nextUsername.length < 3 || nextUsername.length > 64) {
    return { ok: false, error: 'Username must be between 3 and 64 characters.' };
  }
  if (params.newPassword && (params.newPassword.length < 6 || params.newPassword.length > 128)) {
    return { ok: false, error: 'New password must be between 6 and 128 characters.' };
  }
  const nextSalt = params.newPassword
    ? bytesToHex(window.crypto.getRandomValues(new Uint8Array(16)))
    : existing.salt;
  const nextHash = params.newPassword
    ? await deriveStaticHash(params.newPassword, nextSalt)
    : existing.hash;

  const updated: StaticAdminRecord = {
    username: nextUsername,
    salt: nextSalt,
    hash: nextHash,
  };
  window.localStorage.setItem(STATIC_CRED_STORAGE_KEY, JSON.stringify(updated));
  return { ok: true, username: nextUsername };
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [staticMode, setStaticMode] = useState(false);
  const [needsStaticSetup, setNeedsStaticSetup] = useState(false);
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
    const enterStaticMode = () => {
      if (!active) return;
      setStaticMode(true);
      const record = readStaticAdminRecord();
      if (!record) {
        setNeedsStaticSetup(true);
        setAuthenticated(false);
        return;
      }
      setNeedsStaticSetup(false);
      const isUnlocked =
        window.sessionStorage.getItem(STATIC_UNLOCK_SESSION_KEY) === '1';
      if (isUnlocked) {
        setAuthenticated(true);
        setAdminUsername(record.username);
      } else {
        setAuthenticated(false);
      }
    };

    fetch('/api/admin/session', {
      credentials: 'same-origin',
    })
      .then(async (res) => {
        if (!active) return;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          enterStaticMode();
          return;
        }
        setStaticMode(false);
        setNeedsStaticSetup(false);
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
        enterStaticMode();
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

  const handleStaticSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanUser = username.trim();
    if (cleanUser.length < 3 || cleanUser.length > 64) {
      setAuthError('Username must be between 3 and 64 characters.');
      return;
    }
    if (password.length < 6 || password.length > 128) {
      setAuthError('Password must be between 6 and 128 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setSigningIn(true);
    try {
      const salt = bytesToHex(window.crypto.getRandomValues(new Uint8Array(16)));
      const hash = await deriveStaticHash(password, salt);
      const record: StaticAdminRecord = { username: cleanUser, salt, hash };
      window.localStorage.setItem(STATIC_CRED_STORAGE_KEY, JSON.stringify(record));
      window.sessionStorage.setItem(STATIC_UNLOCK_SESSION_KEY, '1');
      setNeedsStaticSetup(false);
      setAdminUsername(cleanUser);
      setAuthenticated(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Unable to save admin credentials.'
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSigningIn(true);

    try {
      if (staticMode) {
        const record = readStaticAdminRecord();
        if (!record) {
          setNeedsStaticSetup(true);
          setAuthError('Please create an admin username and password first.');
          return;
        }
        const candidateHash = await deriveStaticHash(password, record.salt);
        if (
          !constantTimeEqual(username.trim(), record.username) ||
          !constantTimeEqual(candidateHash, record.hash)
        ) {
          setAuthError('Invalid username or password. Please try again.');
          return;
        }
        window.sessionStorage.setItem(STATIC_UNLOCK_SESSION_KEY, '1');
        setAdminUsername(record.username);
        setAuthenticated(true);
        setPassword('');
        return;
      }

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
        const record = readStaticAdminRecord();
        if (!record) {
          setNeedsStaticSetup(true);
          setAuthError('Please set your browser admin username and password.');
        }
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
      setAuthError('Unable to sign in. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (staticMode) {
      window.sessionStorage.removeItem(STATIC_UNLOCK_SESSION_KEY);
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
    setConfirmPassword('');
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
              <span>
                {staticMode
                  ? needsStaticSetup
                    ? 'First-Time Admin Setup'
                    : 'Public Web Admin Sign In'
                  : 'Protected Admin Area'}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              {needsStaticSetup ? 'Set Admin Username & Password' : 'Admin Panel Sign In'}
            </h1>
            <p className="text-sm text-[#cbc3d6]">
              {needsStaticSetup
                ? 'Choose a username and password to protect your Admin Panel on this static site.'
                : 'Enter your administrator username and password to access CandyGame management tools.'}
            </p>
          </div>

          <form
            onSubmit={needsStaticSetup ? handleStaticSetup : handleSignIn}
            className="space-y-4"
          >
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
                  placeholder={needsStaticSetup ? 'Min 6 characters' : 'Enter password'}
                  autoComplete={needsStaticSetup ? 'new-password' : 'current-password'}
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

            {needsStaticSetup ? (
              <FormInput
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
              />
            ) : null}

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
              {signingIn
                ? 'Please wait...'
                : needsStaticSetup
                  ? 'Save Credentials & Enter Admin'
                  : 'Sign In to Admin Panel'}
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
