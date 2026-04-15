import { create } from 'zustand';
import { supabase } from '../database/supabase/Client';
import type { User } from '@supabase/supabase-js';

// 1. Tipamos el perfil de nuestra base de datos (Teoría de Elías: Interfaces)
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
    roles?: {
        nombre_rol: string;
    };
}

interface AuthState {
    user: User | null;
    profile: UserProfile | null; // Guardará los datos de la tabla public.usuarios
    isLoading: boolean;
    setUser: (user: User | null) => Promise<void>; // Lo hacemos asíncrono
    checkSession: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    profile: null,
    isLoading: true,

    // Cuando guardamos el usuario, buscamos su rol en la BBDD
    setUser: async (user) => {
        if (!user) {
            set({ user: null, profile: null });
            return;
        }
        try {
            // Hacemos la consulta a la tabla usuarios pidiendo también el nombre_rol
            const { data: profile } = await supabase
                .from('usuarios')
                .select('*, roles(nombre_rol)')
                .eq('id_usuario', user.id)
                .single();

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
                    .single();

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