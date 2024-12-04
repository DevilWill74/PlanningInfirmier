import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { MonthlySchedule, Nurse, DaySchedule } from '../types/schedule';

interface ScheduleState {
  nurses: Nurse[];
  schedule: MonthlySchedule;
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  addNurse: (nurse: Nurse) => Promise<void>;
  deleteNurse: (nurseId: string) => Promise<void>;
  updateSchedule: (nurseId: string, year: number, month: number, newSchedule: DaySchedule[]) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  nurses: [],
  schedule: {},
  loading: false,
  error: null,

  loadData: async () => {
    try {
      set({ loading: true, error: null });

      const [nursesResponse, scheduleResponse] = await Promise.all([
        supabase.from('nurses').select('*').order('name'),
        supabase.from('schedules').select('*')
      ]);

      if (nursesResponse.error) throw nursesResponse.error;
      if (scheduleResponse.error) throw scheduleResponse.error;

      const scheduleData: MonthlySchedule = {};
      scheduleResponse.data?.forEach(item => {
        scheduleData[item.key] = item.schedule;
      });

      set({ 
        nurses: nursesResponse.data || [],
        schedule: scheduleData,
        error: null 
      });
    } catch (error) {
      set({ error: 'Erreur lors du chargement des données' });
      console.error('Error loading data:', error);
    } finally {
      set({ loading: false });
    }
  },

  addNurse: async (nurse: Nurse) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('nurses')
        .insert([{
          id: nurse.id,
          name: nurse.name,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      const { nurses } = get();
      set({ nurses: [...nurses, nurse] });
    } catch (error) {
      set({ error: 'Erreur lors de l\'ajout de l\'infirmier(ère)' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteNurse: async (nurseId: string) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('nurses')
        .delete()
        .eq('id', nurseId);

      if (error) throw error;

      // Supprimer également les plannings associés
      await supabase
        .from('schedules')
        .delete()
        .filter('key', 'like', `%-${nurseId}`);

      const { nurses, schedule } = get();
      const updatedNurses = nurses.filter(n => n.id !== nurseId);
      const updatedSchedule = Object.fromEntries(
        Object.entries(schedule).filter(([key]) => !key.includes(nurseId))
      );

      set({ nurses: updatedNurses, schedule: updatedSchedule });
    } catch (error) {
      set({ error: 'Erreur lors de la suppression de l\'infirmier(ère)' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateSchedule: async (nurseId: string, year: number, month: number, newSchedule: DaySchedule[]) => {
    try {
      set({ loading: true, error: null });
      const key = `${year}-${month}-${nurseId}`;

      const { error } = await supabase
        .from('schedules')
        .upsert({
          key,
          schedule: newSchedule,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      const { schedule } = get();
      set({ 
        schedule: {
          ...schedule,
          [key]: newSchedule
        }
      });
    } catch (error) {
      set({ error: 'Erreur lors de la mise à jour du planning' });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));