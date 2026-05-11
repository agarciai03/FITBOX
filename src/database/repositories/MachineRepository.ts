import type { EstadoMaquina, Maquina } from '../../interfaces/types';
import { supabase } from '../supabase/Client';
export type { EstadoMaquina, Maquina };

export const MachineRepository = {
    getAllMaquinas: async (): Promise<Maquina[]> => {
        const { data, error } = await supabase
            .from('maquinas')
            .select('*, disciplinas(nombre)')
            .order('nombre', { ascending: true });
        if (error) throw error;
        return data as Maquina[];
    },

    createMaquina: async (nombre: string, id_disciplina: string | null, descripcion?: string, tutorial_url?: string): Promise<Maquina> => {
        const { data, error } = await supabase
            .from('maquinas')
            .insert([{ nombre, id_disciplina, descripcion, tutorial_url }])
            .select()
            .single();
        if (error) throw error;
        return data as Maquina;
    },

    updateEstado: async (id_maquina: string, estado: EstadoMaquina, observaciones: string | null, id_usuario_reporte: string): Promise<void> => {
        const fecha_averia = estado === 'Defectuoso' ? new Date().toISOString() : null;
        const observacionesFinales = estado === 'Correcto' ? null : observaciones;
        const { error } = await supabase
            .from('maquinas')
            .update({ estado, fecha_averia, observaciones: observacionesFinales, id_monitor_reporte: id_usuario_reporte })
            .eq('id_maquina', id_maquina);
        if (error) throw error;
    },

    deleteMaquina: async (id_maquina: string): Promise<void> => {
        const { error } = await supabase
            .from('maquinas')
            .delete()
            .eq('id_maquina', id_maquina);
        if (error) throw error;
    },

    getMaquinasByDisciplina: async (id_disciplina: string): Promise<Maquina[]> => {
        const { data, error } = await supabase
            .from('maquinas')
            .select('*')
            .eq('id_disciplina', id_disciplina)
            .order('nombre');
        if (error) throw error;
        return data as Maquina[];
    }
};