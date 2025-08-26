import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Replace with your actual GitHub webhook secret (store securely in env)
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';

/**
 * Verify the GitHub webhook signature.
 * @param body Raw request body (Buffer)
 * @param signature Signature from GitHub header
 * @returns boolean
 */
function verifySignature(body: Buffer, signature: string | undefined): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
  hmac.update(body);
  const digest = `sha256=${hmac.digest('hex')}`;
  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // Get raw body for signature verification
  const rawBody = await req.arrayBuffer();
  const bodyBuffer = Buffer.from(rawBody);

  // Get signature from header
  const signature = req.headers.get('x-hub-signature-256') || undefined;

  // Verify signature
  if (!verifySignature(bodyBuffer, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Parse JSON payload
  let payload;
  try {
    payload = JSON.parse(bodyBuffer.toString());
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Log event type and payload for debugging
  const eventType = req.headers.get('x-github-event');
  console.log(`GitHub webhook event: ${eventType}`, payload);

  // TODO: Handle specific event types (push, pull_request, etc.)
  // Example:
  // if (eventType === 'push') { ... }
  // if (eventType === 'pull_request') { ... }

  // Respond OK
  return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
}