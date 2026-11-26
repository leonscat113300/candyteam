import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface AdminAuthRecord {
  username: string;
  passwordHash: string;
}

interface InboxMessage {
  id: string;
  name: string;
  email: string;
  to: string;
  subject: string;
  message: string;
  source: 'contact-form' | 'inbound-email' | 'gmail';
  externalId?: string;
  submittedAt: string;
  status: 'new' | 'reviewed';
}

interface ServerStoreData {
  adminAuth: AdminAuthRecord;
  messages: InboxMessage[];
}

const PORT = 3000;
const STUDIO_MAILBOX = 'candyteam@info.com';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const ADMIN_COOKIE_NAME = 'cg_admin_session';

const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
    ? process.env.SESSION_SECRET
    : crypto.randomBytes(32).toString('hex');

// Salted scrypt hash for initial admin credentials (stored as salt:hash)
const DEFAULT_ADMIN_AUTH: AdminAuthRecord = {
  username: 'leonscat',
  passwordHash:
    'ed557d08c6e7025c08d31e73401efc6d:fa335309e2a2186625f340e7ac898f21c109734fd50805069b692fef85744873062c470ab7e81344acf3947bdc6c2bb293cb886748a86d05279dfaad9e0ac5c7',
};

const DATA_DIR = path.resolve(process.cwd(), 'server-data');
const STORE_PATH = path.resolve(DATA_DIR, 'candygame-inbox.json');
if (!STORE_PATH.startsWith(DATA_DIR + path.sep)) {
  throw new Error('Invalid server data store path');
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPasswordHash(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  const actualBuf = crypto.scryptSync(password, salt, 64);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

function timingSafeTextEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function ensureStore(): ServerStoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const initial: ServerStoreData = {
      adminAuth: { ...DEFAULT_ADMIN_AUTH },
      messages: [],
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ServerStoreData>;
    const adminAuth =
      parsed.adminAuth &&
      typeof parsed.adminAuth.username === 'string' &&
      typeof parsed.adminAuth.passwordHash === 'string'
        ? parsed.adminAuth
        : { ...DEFAULT_ADMIN_AUTH };
    const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
    return { adminAuth, messages };
  } catch {
    const fallback: ServerStoreData = {
      adminAuth: { ...DEFAULT_ADMIN_AUTH },
      messages: [],
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

function saveStore(data: ServerStoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function signToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: username,
      exp: Date.now() + SESSION_TTL_MS,
      nonce: crypto.randomBytes(8).toString('hex'),
    }),
    'utf8'
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}.${sig}`;
}

function verifyToken(token: string): { username: string } | null {
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return null;
  const payload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  if (!payload || !sig) return null;

  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');

  if (!timingSafeTextEqual(sig, expectedSig)) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    ) as { sub?: string; exp?: number };
    if (
      typeof decoded.sub !== 'string' ||
      typeof decoded.exp !== 'number' ||
      decoded.exp < Date.now()
    ) {
      return null;
    }
    return { username: decoded.sub };
  } catch {
    return null;
  }
}

function parseCookies(headerValue: string | undefined): Record<string, string> {
  if (!headerValue) return {};
  const result: Record<string, string> = {};
  for (const part of headerValue.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      if (key) result[key] = decodeURIComponent(val);
    }
  }
  return result;
}

function extractAdminToken(req: Request): { token: string; viaCookie: boolean } {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return { token: bearer, viaCookie: false };
  }
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[ADMIN_COOKIE_NAME];
  if (cookieToken) {
    return { token: cookieToken, viaCookie: true };
  }
  return { token: '', viaCookie: false };
}

function isSameOriginMutation(req: Request): boolean {
  if (req.headers['x-requested-with'] === 'CandyGameAdmin') {
    return true;
  }
  const origin = req.headers.origin;
  if (!origin) return true;
  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  if (!host) return false;
  try {
    const parsedOrigin = new URL(origin);
    return parsedOrigin.host === host;
  } catch {
    return false;
  }
}

function verifyAdminCredentials(username: string, password: string): boolean {
  const envUser = process.env.ADMIN_USERNAME?.trim();
  const envPass = process.env.ADMIN_PASSWORD;

  if (envPass && envPass.length > 0) {
    const expectedUser = envUser || 'leonscat';
    return (
      timingSafeTextEqual(username, expectedUser) &&
      timingSafeTextEqual(password, envPass)
    );
  }

  const store = ensureStore();
  return (
    timingSafeTextEqual(username, store.adminAuth.username) &&
    verifyPasswordHash(password, store.adminAuth.passwordHash)
  );
}

function stripHtmlTags(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFromHeader(fromRaw: string): { name: string; email: string } {
  const trimmed = fromRaw.trim();
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200;
}

interface GmailPayloadPart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPayloadPart[];
  headers?: Array<{ name?: string; value?: string }>;
}

function decodeBase64Url(input: string): string {
  try {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(normalized, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

function extractGmailBody(payload?: GmailPayloadPart): string {
  if (!payload) return '';

  const findPart = (
    part: GmailPayloadPart,
    targetMime: string
  ): string | null => {
    if (part.mimeType === targetMime && part.body?.data) {
      return decodeBase64Url(part.body.data);
    }
    if (Array.isArray(part.parts)) {
      for (const child of part.parts) {
        const found = findPart(child, targetMime);
        if (found) return found;
      }
    }
    return null;
  };

  const plainText = findPart(payload, 'text/plain');
  if (plainText && plainText.trim()) {
    return plainText.trim();
  }

  const htmlText = findPart(payload, 'text/html');
  if (htmlText && htmlText.trim()) {
    return stripHtmlTags(htmlText);
  }

  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data).trim();
  }

  return '';
}

interface AuthenticatedRequest extends Request {
  adminUser?: string;
}

function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const { token, viaCookie } = extractAdminToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  if (viaCookie && req.method !== 'GET' && !isSameOriginMutation(req)) {
    res.status(403).json({ error: 'Cross-origin request rejected' });
    return;
  }
  const verified = verifyToken(token);
  if (!verified) {
    res.status(401).json({ error: 'Invalid or expired admin session' });
    return;
  }
  req.adminUser = verified.username;
  next();
}

async function startServer(): Promise<void> {
  ensureStore();
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/admin/login', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown> | undefined;
    const username =
      typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const useCookie = body?.useCookie === true;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    if (!verifyAdminCredentials(username, password)) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    const token = signToken(username);

    if (useCookie) {
      const isHttps =
        req.secure || req.headers['x-forwarded-proto'] === 'https';
      const cookieParts = [
        `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}`,
        'Path=/',
        'HttpOnly',
        `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
        isHttps ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax',
      ];
      res.setHeader('Set-Cookie', cookieParts.join('; '));
    }

    res.json({ token, username });
  });

  app.get('/api/admin/session', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    res.json({ authenticated: true, username: req.adminUser });
  });

  app.post('/api/admin/logout', (req: Request, res: Response) => {
    const isHttps =
      req.secure || req.headers['x-forwarded-proto'] === 'https';
    const clearParts = [
      `${ADMIN_COOKIE_NAME}=`,
      'Path=/',
      'HttpOnly',
      'Max-Age=0',
      isHttps ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax',
    ];
    res.setHeader('Set-Cookie', clearParts.join('; '));
    res.json({ ok: true });
  });

  app.put(
    '/api/admin/credentials',
    requireAdmin,
    (req: AuthenticatedRequest, res: Response) => {
      if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length > 0) {
        res.status(409).json({
          error:
            'Credentials are managed via server environment variables (ADMIN_USERNAME / ADMIN_PASSWORD).',
        });
        return;
      }

      const body = req.body as Record<string, unknown> | undefined;
      const currentPassword =
        typeof body?.currentPassword === 'string' ? body.currentPassword : '';
      const newUsername =
        typeof body?.newUsername === 'string' ? body.newUsername.trim() : '';
      const newPassword =
        typeof body?.newPassword === 'string' ? body.newPassword : '';

      const store = ensureStore();
      if (!verifyPasswordHash(currentPassword, store.adminAuth.passwordHash)) {
        res.status(401).json({ error: 'Current password is incorrect.' });
        return;
      }

      if (newUsername && (newUsername.length < 3 || newUsername.length > 64)) {
        res
          .status(400)
          .json({ error: 'Username must be between 3 and 64 characters.' });
        return;
      }

      if (newPassword && (newPassword.length < 6 || newPassword.length > 128)) {
        res
          .status(400)
          .json({ error: 'New password must be between 6 and 128 characters.' });
        return;
      }

      const updatedUsername = newUsername || store.adminAuth.username;
      const updatedHash = newPassword
        ? hashPassword(newPassword)
        : store.adminAuth.passwordHash;

      store.adminAuth = {
        username: updatedUsername,
        passwordHash: updatedHash,
      };
      saveStore(store);

      const nextToken = signToken(updatedUsername);
      res.json({ ok: true, username: updatedUsername, token: nextToken });
    }
  );

  // Public contact form endpoint delivering straight to candyteam@info.com server inbox
  app.post('/api/contact', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown> | undefined;
    const name =
      typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const email =
      typeof body?.email === 'string' ? body.email.trim().slice(0, 200) : '';
    const subject =
      typeof body?.subject === 'string' && body.subject.trim()
        ? body.subject.trim().slice(0, 200)
        : 'General Inquiry';
    const message =
      typeof body?.message === 'string' ? body.message.trim().slice(0, 5000) : '';

    if (!name || !email || !message) {
      res
        .status(400)
        .json({ error: 'Name, email address, and message are required.' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    const entry: InboxMessage = {
      id: `msg-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name,
      email,
      to: STUDIO_MAILBOX,
      subject,
      message,
      source: 'contact-form',
      submittedAt: new Date().toISOString(),
      status: 'new',
    };

    const store = ensureStore();
    store.messages = [entry, ...store.messages];
    saveStore(store);

    res.status(201).json({ ok: true, message: entry });
  });

  // Inbound email webhook for forwarding external emails sent to candyteam@info.com
  app.post('/api/inbound-email', (req: Request, res: Response) => {
    const configuredSecret = process.env.INBOUND_EMAIL_SECRET?.trim();
    const providedSecret =
      typeof req.headers['x-inbound-secret'] === 'string'
        ? req.headers['x-inbound-secret'].trim()
        : '';

    let authorized = false;
    if (configuredSecret && providedSecret) {
      authorized = timingSafeTextEqual(providedSecret, configuredSecret);
    }

    if (!authorized) {
      const { token } = extractAdminToken(req);
      if (token && verifyToken(token)) {
        authorized = true;
      }
    }

    if (!authorized) {
      res.status(401).json({
        error:
          'Unauthorized inbound email webhook. Provide x-inbound-secret or admin authorization.',
      });
      return;
    }

    const body = req.body as Record<string, unknown> | undefined;
    const rawFrom = typeof body?.from === 'string' ? body.from : '';
    const rawFromName = typeof body?.fromName === 'string' ? body.fromName : '';
    const parsedFrom = parseFromHeader(rawFrom);
    const senderEmail = parsedFrom.email;
    const senderName = (rawFromName || parsedFrom.name).trim().slice(0, 120);

    const rawTo =
      typeof body?.to === 'string' && body.to.trim()
        ? body.to.trim().slice(0, 200)
        : STUDIO_MAILBOX;

    const subject =
      typeof body?.subject === 'string' && body.subject.trim()
        ? body.subject.trim().slice(0, 200)
        : '(No Subject)';

    const rawText =
      typeof body?.text === 'string'
        ? body.text
        : typeof body?.message === 'string'
          ? body.message
          : typeof body?.html === 'string'
            ? stripHtmlTags(body.html)
            : '';

    const messageText = rawText.trim().slice(0, 5000);

    if (!senderEmail || !isValidEmail(senderEmail) || !messageText) {
      res.status(400).json({
        error: 'Valid sender email ("from") and message text are required.',
      });
      return;
    }

    const entry: InboxMessage = {
      id: `mail-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name: senderName || senderEmail.split('@')[0],
      email: senderEmail,
      to: rawTo,
      subject,
      message: messageText,
      source: 'inbound-email',
      submittedAt: new Date().toISOString(),
      status: 'new',
    };

    const store = ensureStore();
    store.messages = [entry, ...store.messages];
    saveStore(store);

    res.status(201).json({ ok: true, message: entry });
  });

  app.get('/api/inbox', requireAdmin, (_req: Request, res: Response) => {
    const store = ensureStore();
    res.json({
      mailbox: STUDIO_MAILBOX,
      webhookConfigured: Boolean(process.env.INBOUND_EMAIL_SECRET?.trim()),
      messages: store.messages,
    });
  });

  app.patch('/api/inbox/:id', requireAdmin, (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    const body = req.body as Record<string, unknown> | undefined;
    const status = body?.status;

    if (status !== 'new' && status !== 'reviewed') {
      res.status(400).json({ error: 'Invalid status value.' });
      return;
    }

    const store = ensureStore();
    const exists = store.messages.some((m) => m.id === id);
    if (!exists) {
      res.status(404).json({ error: 'Message not found.' });
      return;
    }

    store.messages = store.messages.map((m) =>
      m.id === id ? { ...m, status } : m
    );
    saveStore(store);
    res.json({ ok: true });
  });

  app.delete('/api/inbox/:id', requireAdmin, (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    const store = ensureStore();
    const before = store.messages.length;
    store.messages = store.messages.filter((m) => m.id !== id);
    if (store.messages.length === before) {
      res.status(404).json({ error: 'Message not found.' });
      return;
    }
    saveStore(store);
    res.json({ ok: true });
  });

  app.post('/api/gmail/sync', requireAdmin, async (req: Request, res: Response) => {
    const rawToken = req.headers['x-gmail-token'];
    const gmailToken = typeof rawToken === 'string' ? rawToken.trim() : '';

    if (!gmailToken || gmailToken.length > 4096) {
      res.status(400).json({
        error: 'Gmail access token is missing. Please sign in with Google first.',
      });
      return;
    }

    try {
      const profileRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/profile',
        {
          headers: { Authorization: `Bearer ${gmailToken}` },
        }
      );

      if (!profileRes.ok) {
        res.status(401).json({
          error:
            'Gmail access token expired or lacks permission. Please sign in with Google again.',
        });
        return;
      }

      const profileData = (await profileRes.json()) as {
        emailAddress?: string;
      };
      const connectedEmail = profileData.emailAddress || '';

      const listRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=in:inbox&maxResults=20',
        {
          headers: { Authorization: `Bearer ${gmailToken}` },
        }
      );

      if (!listRes.ok) {
        res.status(502).json({ error: 'Unable to fetch messages from Gmail API.' });
        return;
      }

      const listData = (await listRes.json()) as {
        messages?: Array<{ id: string; threadId?: string }>;
      };

      const messageRefs = Array.isArray(listData.messages)
        ? listData.messages
        : [];
      const store = ensureStore();
      const existingExternalIds = new Set(
        store.messages
          .map((m) => m.externalId || (m.id.startsWith('gmail-') ? m.id.slice(6) : ''))
          .filter(Boolean)
      );

      const newEntries: InboxMessage[] = [];
      for (const ref of messageRefs) {
        if (!ref.id || existingExternalIds.has(ref.id)) {
          continue;
        }

        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(
            ref.id
          )}?format=full`,
          {
            headers: { Authorization: `Bearer ${gmailToken}` },
          }
        );

        if (!detailRes.ok) continue;

        const detail = (await detailRes.json()) as {
          id?: string;
          internalDate?: string;
          snippet?: string;
          labelIds?: string[];
          payload?: GmailPayloadPart;
        };

        const headers = detail.payload?.headers || [];
        const getHeader = (name: string): string => {
          const found = headers.find(
            (h) => (h.name || '').toLowerCase() === name.toLowerCase()
          );
          return found?.value || '';
        };

        const rawFrom = getHeader('From');
        const parsedFrom = parseFromHeader(rawFrom);
        const senderEmail = parsedFrom.email || connectedEmail || 'unknown@gmail.com';
        const senderName = (parsedFrom.name || senderEmail.split('@')[0] || 'Sender').slice(0, 120);
        const toHeader = (getHeader('To') || connectedEmail || STUDIO_MAILBOX).slice(0, 200);
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

        const bodyText = (
          extractGmailBody(detail.payload) ||
          detail.snippet ||
          '(Empty email body)'
        )
          .trim()
          .slice(0, 5000);

        const isUnread = Array.isArray(detail.labelIds)
          ? detail.labelIds.includes('UNREAD')
          : true;

        newEntries.push({
          id: `gmail-${ref.id}`,
          externalId: ref.id,
          name: senderName,
          email: senderEmail,
          to: toHeader,
          subject,
          message: bodyText,
          source: 'gmail',
          submittedAt,
          status: isUnread ? 'new' : 'reviewed',
        });
      }

      if (newEntries.length > 0) {
        store.messages = [...newEntries, ...store.messages].sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        saveStore(store);
      }

      res.json({
        ok: true,
        connectedEmail,
        importedCount: newEntries.length,
        messages: store.messages,
      });
    } catch {
      res.status(500).json({ error: 'Unexpected error while syncing Gmail inbox.' });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'API route not found' });
        return;
      }
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CandyGame server running on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
