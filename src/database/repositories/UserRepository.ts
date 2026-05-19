import type { Usuario } from '../../interfaces/types';
import { supabase } from '../supabase/Client';

export type { Usuario };

const generateDefaultAvatar = (nombre: string = '', apellidos: string = '') => {
    const nameQuery = encodeURIComponent(`${nombre} ${apellidos}`.trim() || 'User');
    return `https://ui-avatars.com/api/?name=${nameQuery}&background=ef4444&color=fff&bold=true`;
};

export const UserRepository = {
    // Traer todos los usuarios del gimnasio
    getAllUsers: async (): Promise<Usuario[]> => {
        const { data, error } = await supabase
            .from('usuarios')
            .select(`
                *,
                roles(nombre_rol)
            `)
            .order('id_rol', { ascending: true })
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
        if (Object.prototype.hasOwnProperty.call(datosNuevos, 'avatar_url') && (!datosNuevos.avatar_url || datosNuevos.avatar_url.trim() === '')) {
            datosNuevos.avatar_url = generateDefaultAvatar(datosNuevos.nombre, datosNuevos.apellidos);
        }

        const { error } = await supabase
            .from('usuarios')
            .update(datosNuevos)
            .eq('id_usuario', id_usuario);

        if (error) throw error;
    },

    // Sumar o restar XP y comprobar subida de Nivel
    sumarExperiencia: async (id_usuario: string, cantidadXp: number) => {
        try {
            const { error } = await supabase.rpc('dar_experiencia', {
                socio_id: id_usuario,
                cantidad: cantidadXp
            });

            if (error) throw error;

        } catch (error) {
            console.error("Error al modificar XP:", error);
            throw error;
        }
    }
};