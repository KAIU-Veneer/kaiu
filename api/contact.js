/**
 * POST /api/contact
 *
 * Server-side handler for the contact form. The browser never sees where
 * submissions are stored: it posts here, this function validates the payload
 * and forwards it to the Google Apps Script endpoint held in an env var.
 *
 * Required env var:
 *   CONTACT_SHEET_ENDPOINT  Google Apps Script web app URL (server-only secret)
 * Optional env var:
 *   ALLOWED_ORIGINS         Comma-separated origins allowed to post here.
 *                           Defaults to the Vercel deployment's own origin.
 */

const MAX_BODY_BYTES = 8 * 1024;

const LIMITS = {
  name: 100,
  email: 254,
  phone: 40,
  message: 4000,
};

// Best-effort throttle. Serverless instances are recycled and requests can be
// spread across several of them, so this thins out floods rather than
// guaranteeing a hard ceiling. Treat the Apps Script side as the real backstop.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map();

function rateLimited(key) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > RATE_LIMIT_MAX;
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function allowedOrigins(req) {
  const configured = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (configured.length) return configured;

  // Fall back to this request's own origin, so the check is a same-origin
  // check. Set ALLOWED_ORIGINS in production to pin it to your real domains.
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!host) return [];
  const proto = req.headers['x-forwarded-proto'] || (req.socket?.encrypted ? 'https' : 'http');
  return [`${proto}://${host}`];
}

/** Same-origin check, so another site cannot post through this endpoint. */
function originAllowed(req) {
  const allowed = allowedOrigins(req);
  if (!allowed.length) return true;

  const origin = req.headers.origin;
  if (origin) return allowed.includes(origin);

  // Some browsers omit Origin on same-origin form posts; fall back to Referer.
  const referer = req.headers.referer;
  if (referer) {
    try {
      return allowed.includes(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  return false;
}

/** Strip control characters (including CRLF) so nothing can forge sheet rows. */
function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') return JSON.parse(req.body);
    return req.body;
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error('payload too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  if (!originAllowed(req)) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

  const endpoint = process.env.CONTACT_SHEET_ENDPOINT;
  if (!endpoint) {
    console.error('CONTACT_SHEET_ENDPOINT is not configured');
    return res.status(500).json({ ok: false, error: 'server_error' });
  }

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ ok: false, error: 'rate_limited' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  // Honeypot: real people leave it empty. Report success so bots do not retry.
  if (clean(body.company, 100)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const phone = clean(body.phone, LIMITS.phone);
  const message = clean(body.message, LIMITS.message);

  const invalid = [];
  if (name.length < 2) invalid.push('name');
  if (!isEmail(email)) invalid.push('email');
  if (message.length < 5) invalid.push('message');
  if (phone && !/^[\d\s+()-]{6,}$/.test(phone)) invalid.push('phone');
  if (invalid.length) {
    return res.status(400).json({ ok: false, error: 'validation_failed', fields: invalid });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      // Same field names the Apps Script already receives, so the sheet
      // keeps working untouched.
      body: JSON.stringify({ name, email, phone, message }),
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!upstream.ok) {
      console.error('Contact upstream responded', upstream.status);
      return res.status(502).json({ ok: false, error: 'upstream_error' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    // Log server-side only; the client gets a generic message.
    console.error('Contact upstream failed:', err?.name || 'Error');
    return res.status(502).json({ ok: false, error: 'upstream_error' });
  } finally {
    clearTimeout(timeout);
  }
}
