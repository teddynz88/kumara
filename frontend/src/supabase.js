import { createClient } from '@supabase/supabase-js';

// Strip anything that isn't printable ASCII. Supabase URLs and the anon key
// (a JWT) are pure printable ASCII, so this is a no-op for valid values — but
// it defends against an invisible byte-order-mark (U+FEFF) or other stray
// character creeping in via env-var tooling. A BOM in the key lands in the
// Authorization/apikey headers and makes the browser refuse the request with
// "String contains non ISO-8859-1 code point", which blocks all sign-in.
const clean = (s) => (s || '').replace(/[^\x20-\x7E]/g, '').trim();

const supabaseUrl = clean(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = clean(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
