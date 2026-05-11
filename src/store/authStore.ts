import { create } from 'zustand';
import { supabase } from '../database/supabase/Client';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../interfaces/types'; 

export type { UserProfile };

interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isMobileMenuOpen: boolean; 
    setUser: (user: User | null) => Promise<void>;
    checkSession: () => Promise<void>;
    logout: () => Promise<void>;
    toggleMobileMenu: () => void; 
    closeMobileMenu: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    profile: null,
    isLoading: true,
    isMobileMenuOpen: false, 

    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })), 
    closeMobileMenu: () => set({ isMobileMenuOpen: false }), 
    
    setUser: async (user) => {
        if (!user) {
            set({ user: null, profile: null });
            return;
        }
        try {
            const { data: profile } = await supabase
                .from('usuarios')
                .select('*, roles(nombre_rol)')
                .eq('id_usuario', user.id)
                .maybeSingle(); 

            set({ user, profile: profile as UserProfile });
        } catch (error) {
            console.error("Error obteniendo el perfil:", error);
            set({ user, profile: null });
        }
    },
    
    checkSession: async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;

            if (session?.user) {
                const { data: profile } = await supabase
                    .from('usuarios')
                    .select('*, roles(nombre_rol)')
                    .eq('id_usuario', session.user.id)
                    .maybeSingle(); 

                set({ user: session.user, profile: profile as UserProfile, isLoading: false });
            } else {
                set({ user: null, profile: null, isLoading: false });
            }
        } catch (error) {
            console.error("Error comprobando la sesión:", error);
            set({ user: null, profile: null, isLoading: false });
        }
    },
    
    logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
    }
}));