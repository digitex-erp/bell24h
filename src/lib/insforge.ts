import { createClient } from '@insforge/sdk';

/**
 * InsForge SDK Client Configuration
 *
 * This is the main InsForge client used throughout the Bell24H application.
 * It provides access to:
 * - Database operations (users, rfqs, quotes, suppliers, etc.)
 * - Storage (file uploads/downloads)
 * - AI features (chat, image generation)
 * - Serverless functions
 */

if (!process.env.NEXT_PUBLIC_INSFORGE_BASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_INSFORGE_BASE_URL environment variable');
}

if (!process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_INSFORGE_ANON_KEY environment variable');
}

export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
});

/**
 * Usage Examples:
 *
 * Database:
 * const { data, error } = await insforge.database
 *   .from('rfqs')
 *   .select('*')
 *   .eq('user_id', userId);
 *
 * Storage:
 * const { data, error } = await insforge.storage
 *   .from('avatars')
 *   .uploadAuto(file);
 *
 * AI:
 * const completion = await insforge.ai.chat.completions.create({
 *   model: 'anthropic/claude-sonnet-4.5',
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * });
 */
