import { createClient } from '@supabase/supabase-js';
import { supabase } from "../supabase/Client";

// Creamos un "trabajador en la sombra" que NO guarda sesión.
// Le asignamos un "storageKey" único para que Supabase no se queje por consola.
const supabaseSecundario = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storageKey: 'registro-staff-token' // <-- ¡ESTO ELIMINA EL AVISO DE LA CONSOLA!
        }
    }
);

export interface RegisterData {
    nombre: string;
    apellidos: string;
    email: string;
    password?: string;
    dni: string;
    telefono: string;
    sexo: string;
    fecha_nacimiento: string;
    pais: string;
    codigo_postal: string;
    localidad: string;
    provincia: string;
    id_rol?: number;
    avatar_url?: string | null;
    id_disciplina?: string | null;
}

export const AuthRepository = {
    register: async (email: string, password: string, userData: RegisterData) => {
        // USAMOS EL CLIENTE SECUNDARIO AQUÍ
        const { data, error } = await supabaseSecundario.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre: userData.nombre,
                    apellidos: userData.apellidos,
                    dni: userData.dni,
                    telefono: userData.telefono,
                    sexo: userData.sexo,
                    fecha_nacimiento: userData.fecha_nacimiento,
                    pais: userData.pais,
                    codigo_postal: userData.codigo_postal,
                    localidad: userData.localidad,
                    provincia: userData.provincia,
                    id_rol: userData.id_rol || 3,
                    avatar_url: userData.avatar_url || null,
                    id_disciplina: userData.id_disciplina || null
                }
            }
        });

        if (error) throw error;
        return data;
    },

    login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    sendResetPasswordEmail: async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    },

    updatePassword: async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
    }
};