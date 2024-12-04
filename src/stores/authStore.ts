import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { User } from '../types/auth';
import { ADMIN_USER } from '../config/supabaseConfig';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      
      // Vérifier si l'utilisateur admin existe
      const { data: adminExists } = await supabase
        .from('users')
        .select('*')
        .eq('username', ADMIN_USER.username)
        .single();

      if (!adminExists) {
        // Créer l'utilisateur admin
        const { error: adminError } = await supabase
          .from('users')
          .insert([ADMIN_USER]);

        if (adminError) throw adminError;
      }

      set({ initialized: true });
    } catch (error) {
      console.error('Erreur d\'initialisation:', error);
      set({ error: 'Erreur lors de l\'initialisation de la base de données' });
    } finally {
      set({ loading: false });
    }
  },

  login: async (username: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.toLowerCase())
        .eq('password', password)
        .single();

      if (error || !user) {
        set({ error: 'Identifiants incorrects' });
        return false;
      }

      set({ user });
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      set({ error: 'Erreur lors de la connexion' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    set({ user: null });
  },

  addUser: async (userData) => {
    try {
      set({ loading: true, error: null });
      
      const newUser = {
        id: `user_${Date.now()}`,
        username: userData.username.toLowerCase(),
        password: userData.password,
        role: userData.role,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .insert([newUser]);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur d\'ajout d\'utilisateur:', error);
      set({ error: 'Erreur lors de l\'ajout de l\'utilisateur' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  refreshUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username');

      if (error) throw error;

      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = data.find(u => u.id === currentUser.id);
        if (updatedUser) {
          set({ user: updatedUser });
        }
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des utilisateurs:', error);
    }
  }
}));