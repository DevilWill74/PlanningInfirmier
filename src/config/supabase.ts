import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { SUPABASE_CONFIG } from './supabaseConfig';

if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
  throw new Error('Les variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requises');
}

export const supabase = createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .timeout(5000);

    if (error) {
      console.error('Erreur de connexion Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur de connexion Supabase:', error);
    return false;
  }
}

export function subscribeToChanges(callback: () => void) {
  const nurses = supabase
    .channel('nurses-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'nurses' }, callback)
    .subscribe();

  const schedules = supabase
    .channel('schedules-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, callback)
    .subscribe();

  const users = supabase
    .channel('users-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, callback)
    .subscribe();

  return () => {
    nurses.unsubscribe();
    schedules.unsubscribe();
    users.unsubscribe();
  };
}