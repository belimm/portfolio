import 'server-only';
import { createHmac } from 'crypto';

/**
 * Tells me about new contact form messages. Each channel is optional and only runs when its
 * environment variables are set:
 *
 * - Telegram: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (see `npm run telegram:setup`)
 * - Webhook:  CONTACT_WEBHOOK_URL, optionally signed with CONTACT_WEBHOOK_SECRET
 *
 * Runs on the server, so no token ever reaches the browser. Failures are logged, never thrown:
 * a broken notification must not break the contact form.
 */
export type ContactNotification = {
   name: string;
   email: string;
   body: string;
   createdAt: string;
   /** False when saving to the admin inbox failed, so this notification is the only copy. */
   savedToInbox: boolean;
};

const TIMEOUT_MS = 5000;
// Telegram rejects messages over 4096 characters; leave room for the header lines.
const TELEGRAM_BODY_LIMIT = 3500;

export const notificationChannels = () => ({
   telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
   webhook: Boolean(process.env.CONTACT_WEBHOOK_URL),
});

function siteUrl() {
   return (process.env.SITE_URL || 'https://www.belim.dev').replace(/\/$/, '');
}

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function telegramText(message: ContactNotification) {
   const body =
      message.body.length > TELEGRAM_BODY_LIMIT ? `${message.body.slice(0, TELEGRAM_BODY_LIMIT)}…` : message.body;
   return [
      `<b>New message from ${escapeHtml(message.name)}</b>`,
      escapeHtml(message.email),
      '',
      escapeHtml(body),
      '',
      message.savedToInbox
         ? `<a href="${siteUrl()}/admin/messages">Open the inbox</a>`
         : '⚠️ Saving to the inbox failed. This is the only copy.',
   ].join('\n');
}

async function sendTelegram(message: ContactNotification) {
   const token = process.env.TELEGRAM_BOT_TOKEN!;
   const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
         chat_id: process.env.TELEGRAM_CHAT_ID,
         text: telegramText(message),
         parse_mode: 'HTML',
         link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
   });
   if (!res.ok) {
      // Telegram explains the problem in `description` (wrong chat id, bot blocked, …).
      const data = await res.json().catch(() => ({}));
      throw new Error(`Telegram responded ${res.status}: ${data.description ?? 'unknown error'}`);
   }
}

async function sendWebhook(message: ContactNotification) {
   const payload = JSON.stringify({
      type: 'contact_message',
      ...message,
      inboxUrl: `${siteUrl()}/admin/messages`,
   });
   const headers: Record<string, string> = { 'Content-Type': 'application/json' };
   const secret = process.env.CONTACT_WEBHOOK_SECRET;
   if (secret) {
      // Lets the receiver check the request really came from this site.
      headers['X-Signature-256'] = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;
   }
   const res = await fetch(process.env.CONTACT_WEBHOOK_URL!, {
      method: 'POST',
      headers,
      body: payload,
      signal: AbortSignal.timeout(TIMEOUT_MS),
   });
   if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
}

/** Sends to every configured channel. Returns true if at least one of them delivered. */
export async function notifyNewMessage(message: ContactNotification): Promise<boolean> {
   const channels = notificationChannels();
   const sends: Promise<void>[] = [];
   if (channels.telegram) sends.push(sendTelegram(message));
   if (channels.webhook) sends.push(sendWebhook(message));

   const results = await Promise.allSettled(sends);
   for (const result of results) {
      if (result.status === 'rejected') console.error('Contact notification failed:', result.reason);
   }
   return results.some((r) => r.status === 'fulfilled');
}
