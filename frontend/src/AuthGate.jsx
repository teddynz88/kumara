import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Login from './pages/Login';
import App from './App';
import { KumaraMark } from './ui';

// Decides what the whole app shows: a loading flash while the session is
// resolved, the Login screen when signed out, or the app when signed in.
export default function AuthGate() {
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="grad-hero flex min-h-dvh items-center justify-center">
        <span className="text-plum-700 animate-pulse"><KumaraMark className="w-12 h-12" /></span>
      </div>
    );
  }

  return session ? <App session={session} /> : <Login />;
}
