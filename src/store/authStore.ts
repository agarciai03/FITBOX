import { create } from 'zustand';
import { supabase } from '../database/supabase/Client';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
    apellidos: string;
    dni: string;
    sexo: string;
    telefono: string;
    pais: string;
    provincia: string;
    codigo_postal: string;
    localidad: string;
    id_usuario: string;
    nombre: string;
    email: string;
    id_rol: number;
    avatar_url?: string;
    roles?: {
        nombre_rol: string;
    };
}

interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    setUser: (user: User | null) => Promise<void>;
    checkSession: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    profile: null,
    isLoading: true,
    
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
                    .maybeSingle(); // <-- CAMBIO AQUÍ TAMBIÉN

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