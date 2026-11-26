import { getApps, initializeApp } from 'firebase/app';
import {
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updatePassword,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const defaultApp =
  getApps().find((a) => a.name === '[DEFAULT]') || initializeApp(firebaseConfig);
export const adminAuth = getAuth(defaultApp);

const gmailApp =
  getApps().find((a) => a.name === 'gmail-sync') ||
  initializeApp(firebaseConfig, 'gmail-sync');
const gmailAuthInstance = getAuth(gmailApp);

export function resolveAdminEmail(identifier: string): string {
  const clean = identifier.trim();
  if (!clean) return '';
  return clean.includes('@') ? clean : `${clean.toLowerCase()}@candygame.app`;
}

export function formatAdminDisplayName(user: User | null): string {
  const email = user?.email || '';
  if (!email) return 'Admin';
  return email.endsWith('@candygame.app')
    ? email.slice(0, -'@candygame.app'.length)
    : email;
}

export function isPasswordAuthenticatedUser(user: User | null): boolean {
  if (!user) return false;
  return user.providerData.some(
    (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID
  );
}

export async function signInAdminWithEmailPassword(
  identifier: string,
  password: string
): Promise<User> {
  const email = resolveAdminEmail(identifier);
  const result = await signInWithEmailAndPassword(adminAuth, email, password);
  return result.user;
}

export async function sendAdminPasswordReset(identifier: string): Promise<void> {
  const email = resolveAdminEmail(identifier);
  await sendPasswordResetEmail(adminAuth, email);
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = adminAuth.currentUser;
  if (!user || !user.email) {
    throw new Error('No active Firebase password session found.');
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function signOutAdminAuth(): Promise<void> {
  await adminAuth.signOut();
}

const provider = new GoogleAuthProvider();
for (const scope of GMAIL_SCOPES) {
  provider.addScope(scope);
}
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initGmailAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: (user: User | null) => void
) => {
  return onAuthStateChanged(gmailAuthInstance, (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess?.(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure?.(user);
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure?.(null);
    }
  });
};

export const signInWithGmail = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(gmailAuthInstance, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain Gmail access token from Google sign-in.');
    }
    cachedAccessToken = credential.accessToken;
    return {
      user: result.user,
      accessToken: cachedAccessToken,
    };
  } finally {
    isSigningIn = false;
  }
};

export const getGmailAccessToken = (): string | null => cachedAccessToken;

export const clearGmailAccessToken = (): void => {
  cachedAccessToken = null;
};

export const disconnectGmail = async (): Promise<void> => {
  cachedAccessToken = null;
  await gmailAuthInstance.signOut();
};

interface GmailPart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPart[];
  headers?: Array<{ name?: string; value?: string }>;
}

function decodeBase64UrlBrowser(input: string): string {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const binary = window.atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

function stripTagsBrowser(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractBodyBrowser(payload?: GmailPart): string {
  if (!payload) return '';
  const findMime = (part: GmailPart, mime: string): string | null => {
    if (part.mimeType === mime && part.body?.data) {
      return decodeBase64UrlBrowser(part.body.data);
    }
    if (Array.isArray(part.parts)) {
      for (const child of part.parts) {
        const hit = findMime(child, mime);
        if (hit) return hit;
      }
    }
    return null;
  };
  const plain = findMime(payload, 'text/plain');
  if (plain && plain.trim()) return plain.trim();
  const html = findMime(payload, 'text/html');
  if (html && html.trim()) return stripTagsBrowser(html);
  if (payload.body?.data) return decodeBase64UrlBrowser(payload.body.data).trim();
  return '';
}

function parseFromHeaderBrowser(raw: string): { name: string; email: string } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(?:"?([^"<]*)"?\s*)?<([^>\s]+@[^>\s]+)>$/);
  if (match) {
    return {
      name: (match[1] || '').trim() || match[2].split('@')[0],
      email: match[2].trim(),
    };
  }
  return {
    name: trimmed.split('@')[0] || 'Sender',
    email: trimmed,
  };
}

export async function fetchGmailInboxDirect(
  accessToken: string,
  existingExternalIds: Set<string>
): Promise<{
  connectedEmail: string;
  entries: Array<{
    id: string;
    externalId: string;
    name: string;
    email: string;
    to: string;
    subject: string;
    message: string;
    source: 'gmail';
    submittedAt: string;
    status: 'new' | 'reviewed';
  }>;
}> {
  const profileRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/profile',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!profileRes.ok) {
    const err = new Error(
      'Gmail access token expired or lacks permission. Please sign in with Google again.'
    );
    (err as { status?: number }).status = profileRes.status;
    throw err;
  }
  const profileData = (await profileRes.json()) as { emailAddress?: string };
  const connectedEmail = profileData.emailAddress || '';

  const listRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=in:inbox&maxResults=20',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!listRes.ok) {
    throw new Error('Unable to fetch messages from Gmail.');
  }
  const listData = (await listRes.json()) as {
    messages?: Array<{ id: string }>;
  };

  const refs = Array.isArray(listData.messages) ? listData.messages : [];
  const entries: Array<{
    id: string;
    externalId: string;
    name: string;
    email: string;
    to: string;
    subject: string;
    message: string;
    source: 'gmail';
    submittedAt: string;
    status: 'new' | 'reviewed';
  }> = [];

  for (const ref of refs) {
    if (!ref.id || existingExternalIds.has(ref.id)) continue;
    const detailRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(
        ref.id
      )}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!detailRes.ok) continue;

    const detail = (await detailRes.json()) as {
      internalDate?: string;
      snippet?: string;
      labelIds?: string[];
      payload?: GmailPart;
    };
    const headers = detail.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h) => (h.name || '').toLowerCase() === name.toLowerCase())
        ?.value || '';

    const parsedFrom = parseFromHeaderBrowser(getHeader('From'));
    const senderEmail = parsedFrom.email || connectedEmail || 'unknown@gmail.com';
    const senderName = (parsedFrom.name || senderEmail.split('@')[0] || 'Sender').slice(0, 120);
    const to = (getHeader('To') || connectedEmail).slice(0, 200);
    const subject = (getHeader('Subject') || '(No Subject)').slice(0, 200);
    const dateHeader = getHeader('Date');

    let submittedAt = new Date().toISOString();
    if (detail.internalDate && /^\d+$/.test(detail.internalDate)) {
      submittedAt = new Date(Number(detail.internalDate)).toISOString();
    } else if (dateHeader) {
      const parsedDate = Date.parse(dateHeader);
      if (!Number.isNaN(parsedDate)) {
        submittedAt = new Date(parsedDate).toISOString();
      }
    }

    const message = (
      extractBodyBrowser(detail.payload) ||
      detail.snippet ||
      '(Empty email body)'
    )
      .trim()
      .slice(0, 5000);

    const isUnread = Array.isArray(detail.labelIds)
      ? detail.labelIds.includes('UNREAD')
      : true;

    entries.push({
      id: `gmail-${ref.id}`,
      externalId: ref.id,
      name: senderName,
      email: senderEmail,
      to,
      subject,
      message,
      source: 'gmail',
      submittedAt,
      status: isUnread ? 'new' : 'reviewed',
    });
  }

  return { connectedEmail, entries };
}

