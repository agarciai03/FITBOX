import { supabase } from '../supabase/Client';

// Tipamos los estados exactos que nos pidió el profe para no equivocarnos al teclear
export type EstadoMaquina = 'Correcto' | 'Defectuoso' | 'Correcto pero con observaciones';

// Definimos cómo es una máquina según la tabla que tenemos en Supabase
export interface Maquina {
    id_maquina: string;
    nombre: string;
    estado: EstadoMaquina;
    fecha_averia: string | null;
    observaciones: string | null;
    id_monitor_reporte: string | null;
    fecha_registro: string;
}

export const MachineRepository = {

    // Función para traernos todas las máquinas y pintarlas en la web
    getAllMaquinas: async (): Promise<Maquina[]> => {
        const { data, error } = await supabase
            .from('maquinas')
            .select('*')
            .order('nombre', { ascending: true }); // Las ordenamos por la A-Z

        if (error) throw error;
        return data as Maquina[];
    },

    // Función para cuando el admin compre una máquina nueva y la añada
    createMaquina: async (nombre: string): Promise<Maquina> => {
        // Solo mandamos el nombre, la base de datos ya le pone el estado "Correcto" sola
        const { data, error } = await supabase
            .from('maquinas')
            .insert([{ nombre }])
            .select()
            .single();

        if (error) throw error;
        return data as Maquina;
    },

    // Función para cuando un monitor reporte que algo falla o lo arregle
    updateEstado: async (
        id_maquina: string,
        estado: EstadoMaquina,
        observaciones: string | null,
        id_usuario_reporte: string // El ID del monitor que está tocando esto
    ): Promise<void> => {

        // Si el monitor dice que está defectuosa, le ponemos la fecha de hoy
        const fecha_averia = estado === 'Defectuoso' ? new Date().toISOString() : null;

        // Si la máquina ya vuelve a estar "Correcto", le borramos los comentarios viejos
        const observacionesFinales = estado === 'Correcto' ? null : observaciones;

        const { error } = await supabase
            .from('maquinas')
            .update({
                estado,
                fecha_averia,
                observaciones: observacionesFinales,
                id_monitor_reporte: id_usuario_reporte
            })
            .eq('id_maquina', id_maquina);

        if (error) throw error;
    }
};