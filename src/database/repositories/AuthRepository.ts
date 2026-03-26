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
    pais: string;
    codigo_postal: string;
    localidad: string;
    provincia: string;
}

export const AuthRepository = {

    // función recibe (email, password) y (userData)
    register: async (email: string, password: string, userData: RegisterData) => {

        // Enviamos todo a Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    // Mapeamos uno a uno los campos para que lleguen a SQL
                    nombre: userData.nombre,
                    apellidos: userData.apellidos,
                    dni: userData.dni,
                    telefono: userData.telefono,
                    sexo: userData.sexo,
                    pais: userData.pais,
                    codigo_postal: userData.codigo_postal,
                    localidad: userData.localidad,
                    provincia: userData.provincia
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