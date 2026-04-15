import { supabase } from '../supabase/Client';

export interface Usuario {
    id_usuario: string;
    nombre: string;
    apellidos: string;
    email: string;
    id_rol: number;
    telefono: string;
    avatar_url?: string; 
    roles?: { nombre_rol: string };
}

export const UserRepository = {
    // Traer todos los usuarios del gimnasio
    getAllUsers: async (): Promise<Usuario[]> => {
        const { data, error } = await supabase
            .from('usuarios')
            .select(`
                *,
                roles(nombre_rol)
            `)
            .order('id_rol', { ascending: true }) // Primero Administradores(1), Monitores(2), Socios(3)
            .order('nombre', { ascending: true });

        if (error) throw error;
        return data as Usuario[];
    },

    // Dar de baja a un usuario de la base de datos
    deleteUser: async (id_usuario: string): Promise<void> => {
        const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id_usuario', id_usuario);

        if (error) throw error;
    },

    // Actualizar datos de un usuario
    updateUser: async (id_usuario: string, datosNuevos: Partial<Usuario>): Promise<void> => {
        // Le pasamos solo los campos que queremos actualizar
        const { error } = await supabase
            .from('usuarios')
            .update(datosNuevos)
            .eq('id_usuario', id_usuario);

        if (error) throw error;
    }
};