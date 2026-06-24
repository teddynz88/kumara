// Auth helpers built on Supabase. The Supabase JS client persists the
// session in localStorage and refreshes it automatically, so recipe/plan/
// shopping queries made through `supabase` are already scoped to the
// logged-in user by row-level security. These helpers cover the bits that
// aren't automatic: reaching the FastAPI backend with the user's token, and
// the login/signup/signout actions.

import { supabase } from '../supabase';

// Google sign-in only shows when configured (a Google OAuth client added in
// the Supabase dashboard). Flag it on with VITE_GOOGLE_AUTH=1 once that's done.
export const GOOGLE_ENABLED = import.meta.env.VITE_GOOGLE_AUTH === '1';

export async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

// fetch() wrapper that attaches the user's JWT, so the backend can verify
// the caller and scope data to them.
export async function authedFetch(url, options = {}) {
  const token = await getAccessToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

export function signUpWithPassword(email, password) {
  return supabase.auth.signUp({ email, password });
}

export function signInWithPassword(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

export function signOut() {
  return supabase.auth.signOut();
}

// Copy a public pack's recipes into my own library (server-side RPC, added by
// the users migration). Returns how many were added.
export async function addStarterPack(slug = 'teddy-starter') {
  const { data, error } = await supabase.rpc('add_starter_pack', { pack_slug: slug });
  if (error) throw error;
  return data ?? 0;
}

export async function packRecipeCount(slug = 'teddy-starter') {
  const { data, error } = await supabase.rpc('pack_recipe_count', { pack_slug: slug });
  if (error) return null;
  return data ?? null;
}

// List the public recipe packs on offer (e.g. Teddy's starter pack, the
// Health with Bec plans). Returns [] if the packs table doesn't exist yet
// (i.e. before the users/accounts migration has been run).
export async function listPacks() {
  const { data, error } = await supabase
    .from('recipe_packs')
    .select('slug, name, creator_name, description')
    .eq('is_public', true)
    .order('created_at', { ascending: true });
  if (error) return [];
  return data ?? [];
}
