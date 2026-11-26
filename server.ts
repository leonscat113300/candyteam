import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

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
  messages: InboxMessage[];
}

const PORT = 3000;
const STUDIO_MAILBOX = 'candyteam@info.com';
const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

const FIREBASE_CONFIG_PATH = path.resolve(
  process.cwd(),
  'firebase-applet-config.json'
);
const FIREBASE_PROJECT_ID = (() => {
  try {
    const parsed = JSON.parse(
      fs.readFileSync(FIREBASE_CONFIG_PATH, 'utf8')
    ) as { projectId?: string };
    return typeof parsed.projectId === 'string' ? parsed.projectId : '';
  } catch {
    return '';
  }
})();

const DATA_DIR = path.resolve(process.cwd(), 'server-data');
const STORE_PATH = path.resolve(DATA_DIR, 'candygame-inbox.json');
if (!STORE_PATH.startsWith(DATA_DIR + path.sep)) {
  throw new Error('Invalid server data store path');
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
    const initial: ServerStoreData = { messages: [] };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ServerStoreData>;
    const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
    return { messages };
  } catch {
    const fallback: ServerStoreData = { messages: [] };
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

let cachedCerts: Record<string, string> = {};
let cachedCertsExpiresAt = 0;

async function getFirebasePublicCerts(): Promise<Record<string, string>> {
  if (Date.now() < cachedCertsExpiresAt && Object.keys(cachedCerts).length > 0) {
    return cachedCerts;
  }
  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) {
    throw new Error('Unable to fetch Firebase verification certificates');
  }
  const certs = (await res.json()) as Record<string, string>;
  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSec = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  cachedCerts = certs;
  cachedCertsExpiresAt = Date.now() + Math.max(60, maxAgeSec) * 1000;
  return certs;
}

async function verifyFirebaseIdToken(
  token: string
): Promise<{ uid: string; email?: string } | null> {
  if (!FIREBASE_PROJECT_ID) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;

  try {
    const header = JSON.parse(
      Buffer.from(headerB64, 'base64url').toString('utf8')
    ) as { alg?: string; kid?: string };
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) {
      return null;
    }

    const certs = await getFirebasePublicCerts();
    const certPem = certs[header.kid];
    if (!certPem) return null;

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerB64}.${payloadB64}`);
    verifier.end();
    const signature = Buffer.from(sigB64, 'base64url');
    if (!verifier.verify(certPem, signature)) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    ) as {
      aud?: string;
      iss?: string;
      sub?: string;
      email?: string;
      exp?: number;
      iat?: number;
      auth_time?: number;
      firebase?: { sign_in_provider?: string };
    };

    const nowSec = Math.floor(Date.now() / 1000);
    if (
      payload.aud !== FIREBASE_PROJECT_ID ||
      payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}` ||
      typeof payload.sub !== 'string' ||
      !payload.sub ||
      typeof payload.exp !== 'number' ||
      payload.exp <= nowSec ||
      typeof payload.iat !== 'number' ||
      payload.iat > nowSec + 300 ||
      typeof payload.auth_time !== 'number' ||
      payload.auth_time > nowSec + 300 ||
      payload.firebase?.sign_in_provider === 'anonymous'
    ) {
      return null;
    }

    return { uid: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

function extractBearerToken(req: Request): string {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return '';
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

async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const verified = await verifyFirebaseIdToken(token);
  if (!verified) {
    res.status(401).json({ error: 'Invalid or expired Firebase ID token' });
    return;
  }
  req.adminUser = verified.email || verified.uid;
  next();
}

async function startServer(): Promise<void> {
  ensureStore();
  const app = express();
  app.set('trust proxy', 1);

  const defaultSiteOrigins = [
    'http://candygame.bond',
    'https://candygame.bond',
    'http://www.candygame.bond',
    'https://www.candygame.bond',
  ];
  const configuredOrigins = (process.env.ALLOWED_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = Array.from(
    new Set([...defaultSiteOrigins, ...configuredOrigins])
  );
  if (allowedOrigins.length > 0) {
    app.use('/api', (req: Request, res: Response, next: NextFunction) => {
      const origin = req.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader(
          'Access-Control-Allow-Methods',
          'GET,POST,PUT,PATCH,DELETE,OPTIONS'
        );
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, X-Requested-With, x-gmail-token, x-inbound-secret'
        );
      }
      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }
      next();
    });
  }

  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

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
  app.post('/api/inbound-email', async (req: Request, res: Response) => {
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
      const token = extractBearerToken(req);
      if (token && (await verifyFirebaseIdToken(token))) {
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
