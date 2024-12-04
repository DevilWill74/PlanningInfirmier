import { useEffect } from 'react';
import { subscribeToChanges } from '../config/supabase';
import { useScheduleStore } from '../stores/scheduleStore';
import { useAuthStore } from '../stores/authStore';

export function useRealtimeSync() {
  const loadScheduleData = useScheduleStore(state => state.loadData);
  const refreshUsers = useAuthStore(state => state.refreshUsers);

  useEffect(() => {
    const handleDataChange = () => {
      console.log('Changements détectés, actualisation des données...');
      loadScheduleData();
      refreshUsers();
    };

    const unsubscribe = subscribeToChanges(handleDataChange);
    return () => {
      unsubscribe();
    };
  }, [loadScheduleData, refreshUsers]);
}