import { supabase } from "../supabase/Client";

// Todos los datos que tu RegisterPage va a enviar.
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
}

export const AuthRepository = {
    register: async (email: string, password: string, userData: RegisterData) => {
        const { data, error } = await supabase.auth.signUp({
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
                    avatar_url: userData.avatar_url || null
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
    }
};