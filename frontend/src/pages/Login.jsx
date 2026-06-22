import { useState } from 'react';
import { CircleAlert, Mail, Lock } from 'lucide-react';
import {
  signInWithPassword, signUpWithPassword, signInWithGoogle, GOOGLE_ENABLED,
} from '../lib/auth';
import { KumaraMark, input } from '../ui';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim() || password.length < 6) {
      setError('Enter your email and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error: err } = await signUpWithPassword(email.trim(), password);
        if (err) throw err;
        // If email confirmation is on, there's no session yet.
        if (!data.session) {
          setNotice('Check your inbox to confirm your email, then sign in.');
          setMode('signin');
        }
        // If confirmation is off, onAuthStateChange swaps to the app automatically.
      } else {
        const { error: err } = await signInWithPassword(email.trim(), password);
        if (err) throw err;
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      const { error: err } = await signInWithGoogle();
      if (err) throw err;
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  return (
    <div className="grad-hero flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="text-plum-700 mb-4"><KumaraMark className="w-14 h-14" /></span>
          <h1 className="type-display text-ink-900">Kūmara</h1>
          <p className="text-ink-600 mt-2">
            {mode === 'signup' ? 'Create your account to get cooking.' : 'Welcome back.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null); }}
              placeholder="you@email.com"
              className={`${input} pl-9 bg-sand-50`}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null); }}
              placeholder="Password"
              className={`${input} pl-9 bg-sand-50`}
            />
          </div>

          {error && (
            <div className="flex gap-2 items-start text-sm text-clay-500 bg-clay-500/10 rounded-xl px-3 py-2">
              <CircleAlert className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}
          {notice && (
            <p className="text-sm text-sage-500 bg-sage-500/10 rounded-xl px-3 py-2">{notice}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="grad-cta w-full py-3 rounded-xl text-sand-50 font-semibold text-sm mt-1 disabled:opacity-50"
          >
            {busy ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {GOOGLE_ENABLED && (
          <>
            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 h-px bg-stone-200" />
              <span className="eyebrow-sm text-ink-600">or</span>
              <span className="flex-1 h-px bg-stone-200" />
            </div>
            <button
              onClick={handleGoogle}
              className="w-full py-3 rounded-xl border border-stone-200 bg-sand-50 text-ink-900 font-semibold text-sm hover:bg-sand-100 transition-colors inline-flex items-center justify-center gap-2"
            >
              <GoogleGlyph /> Continue with Google
            </button>
          </>
        )}

        <p className="text-center text-sm text-ink-600 mt-6">
          {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
          <button
            onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null); setNotice(null); }}
            className="text-plum-500 hover:text-plum-700 font-medium"
          >
            {mode === 'signup' ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  );
}

function friendlyError(err) {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('invalid login')) return 'That email and password don’t match.';
  if (msg.includes('already registered')) return 'That email already has an account — sign in instead.';
  if (msg.includes('provider is not enabled')) return 'Google sign-in isn’t set up yet. Use email and password for now.';
  if (msg.includes('rate limit')) return 'Too many attempts — wait a moment and try again.';
  return err?.message || 'Something went wrong. Try again.';
}

function GoogleGlyph() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}
