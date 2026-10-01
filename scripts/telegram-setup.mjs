#!/usr/bin/env node
/**
 * Finds the chat id for contact form notifications and sends a test message.
 *
 *   1. Create a bot with @BotFather in Telegram and put its token in .env.local:
 *        TELEGRAM_BOT_TOKEN=123456:ABC...
 *   2. Open the bot in Telegram and send it any message (e.g. /start).
 *   3. npm run telegram:setup            -> prints your chat id
 *   4. Add TELEGRAM_CHAT_ID=<id> to .env.local and run it again -> sends a test message
 */
import { readFileSync } from 'node:fs';

function fromEnvFile(name) {
   try {
      const line = readFileSync('.env.local', 'utf8')
         .split('\n')
         .find((l) => l.startsWith(`${name}=`));
      return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, '') || undefined;
   } catch {
      return undefined;
   }
}

const token = process.env.TELEGRAM_BOT_TOKEN || fromEnvFile('TELEGRAM_BOT_TOKEN');
const chatId = process.env.TELEGRAM_CHAT_ID || fromEnvFile('TELEGRAM_CHAT_ID');

if (!token) {
   console.error('Set TELEGRAM_BOT_TOKEN in .env.local first (create a bot with @BotFather).');
   process.exit(1);
}

async function telegram(method, body) {
   const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
   });
   const data = await res.json();
   if (!data.ok) throw new Error(`${method}: ${data.description}`);
   return data.result;
}

const bot = await telegram('getMe');
console.log(`Bot: @${bot.username}`);

if (chatId) {
   await telegram('sendMessage', {
      chat_id: chatId,
      text: '<b>Test from your portfolio</b>\nContact form messages will arrive here.',
      parse_mode: 'HTML',
   });
   console.log(`Sent a test message to chat ${chatId}. If it arrived, set the same two variables on Vercel.`);
} else {
   const updates = await telegram('getUpdates', { limit: 50 });
   const chats = new Map();
   for (const update of updates) {
      const chat = (update.message ?? update.channel_post ?? update.my_chat_member)?.chat;
      if (chat) chats.set(chat.id, chat);
   }
   if (chats.size === 0) {
      console.log(`No chats yet. Open https://t.me/${bot.username}, send it any message, then run this again.`);
   } else {
      console.log('\nChats that wrote to the bot:');
      for (const chat of chats.values()) {
         const label = chat.title ?? [chat.first_name, chat.last_name].filter(Boolean).join(' ') ?? chat.username;
         console.log(`  TELEGRAM_CHAT_ID=${chat.id}   (${chat.type}: ${label})`);
      }
      console.log('\nAdd the right line to .env.local and run `npm run telegram:setup` again to send a test message.');
   }
}
