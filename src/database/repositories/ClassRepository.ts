import type { Clase, Disciplina, Reserva, Rutina } from '../../interfaces/types';
import { supabase } from '../supabase/Client';

export type { Disciplina, Rutina, Clase, Reserva };

export const ClassRepository = {

    getAllDisciplinas: async (): Promise<Disciplina[]> => {
        const { data, error } = await supabase
            .from('disciplinas')
            .select('*')
            .order('nombre');

        if (error) throw error;
        return data as Disciplina[];
    },

    getRutinasByDisciplina: async (id_disciplina: string): Promise<Rutina[]> => {
        const { data, error } = await supabase
            .from('rutinas')
            .select('*')
            .eq('id_disciplina', id_disciplina);

        if (error) throw error;
        return data as Rutina[];
    },

    getAllClases: async (): Promise<Clase[]> => {
        // Le pedimos a Supabase que cruce las Reservas y nos traiga el nombre de los Usuarios apuntados
        const { data, error } = await supabase
            .from('clases')
            .select(`
                *,
                disciplinas(nombre),
                usuarios(nombre, apellidos),
                reservas(id, id_socio, estado, usuarios(nombre, apellidos))
            `)
            .order('fecha', { ascending: true })
            .order('hora_inicio', { ascending: true });

        if (error) throw error;
        return data as Clase[];
    },

    // Añadimos 'total_reservas' y 'reservas' a la lista de cosas que ignoramos al crear
    createClase: async (claseData: Omit<Clase, 'id_clase' | 'disciplinas' | 'usuarios' | 'total_reservas' | 'reservas'>): Promise<Clase> => {
        const { data, error } = await supabase
            .from('clases')
            .insert([claseData])
            .select()
            .single();

        if (error) throw error;
        return data as Clase;
    },

    deleteClase: async (id_clase: string): Promise<void> => {
        const { error } = await supabase
            .from('clases')
            .delete()
            .eq('id_clase', id_clase);

        if (error) throw error;
    },

    // Apuntar a un socio a una clase
    reservarClase: async (id_clase: string, id_socio: string): Promise<Reserva> => {
        const { data, error } = await supabase
            .from('reservas')
            .insert([{ id_clase, id_socio }]) // Se crea con estado 'activa' por defecto
            .select()
            .single();

        if (error) {
            // Cazamos el error de "Duplicado" 
            if (error.code === '23505') {
                throw new Error('Ya tienes una reserva activa para esta clase.');
            }
            throw new Error('No se pudo completar la reserva.');
        }
        return data as Reserva;
    },

    // Traer las reservas activas de un socio (Para su perfil o calendario)
    getReservasBySocio: async (id_socio: string): Promise<Reserva[]> => {
        const { data, error } = await supabase
            .from('reservas')
            .select(`
                *,
                clases (
                    *,
                    disciplinas(nombre),
                    usuarios(nombre, apellidos)
                )
            `)
            .eq('id_socio', id_socio)
            .eq('estado', 'activa');

        if (error) throw error;
        return data as Reserva[];
    },

    // Cancelar una reserva (Por si el socio no puede ir)
    cancelarReserva: async (id_reserva: string): Promise<void> => {
        const { error } = await supabase
            .from('reservas')
            .update({ estado: 'cancelada' })
            .eq('id', id_reserva);

        if (error) throw error;
    }
};