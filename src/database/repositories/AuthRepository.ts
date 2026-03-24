import { supabase } from "../supabase/Client";


export const AuthRepository = {

    // Función para registrar al usuario
    register: async (email: string, password: string, nombre: string) => {
        // Fíjate cómo le pasamos el "nombre" en los metadatos. 
        // Nuestro Trigger de SQL leerá esto y lo meterá en tu tabla 'usuarios' automáticamente.
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre: nombre,
                }
            }
        });

        if (error) throw error;
        return data;
    },

    // Más adelante, podemos mover aquí el Login que hicimos en LoginPage
    login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    }
};