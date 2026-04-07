import { supabase } from '../supabase/Client';

// ==========================================
// 1. TIPADOS (Para que TypeScript no llore)
// ==========================================

export interface Disciplina {
    id_disciplina: string;
    nombre: string;
}

export interface Rutina {
    id_rutina: string;
    id_disciplina: string;
    dia_semana: string;
    titulo: string;
    descripcion: string;
}

export interface Clase {
    id_clase: string;
    id_disciplina: string;
    id_monitor: string | null;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    aforo_maximo: number;
    // Estos campos nos vendrán del JOIN con las otras tablas para pintarlo fácil en React
    disciplinas?: { nombre: string };
    usuarios?: { nombre: string; apellidos: string };
}

// ==========================================
// 2. EL REPOSITORIO (Nuestras herramientas)
// ==========================================

export const ClassRepository = {

    // ----------------------------------------------------
    // HERRAMIENTAS PARA DISCIPLINAS Y RUTINAS
    // ----------------------------------------------------

    // Nos traemos los deportes pactados (Crossfit, Boxeo...)
    getAllDisciplinas: async (): Promise<Disciplina[]> => {
        const { data, error } = await supabase
            .from('disciplinas')
            .select('*')
            .order('nombre');

        if (error) throw error;
        return data as Disciplina[];
    },

    // Le pasamos el ID de un deporte y nos devuelve sus 5 días de rutinas
    getRutinasByDisciplina: async (id_disciplina: string): Promise<Rutina[]> => {
        const { data, error } = await supabase
            .from('rutinas')
            .select('*')
            .eq('id_disciplina', id_disciplina);

        if (error) throw error;
        return data as Rutina[];
    },

    // ----------------------------------------------------
    // HERRAMIENTAS PARA EL CALENDARIO (CLASES)
    // ----------------------------------------------------

    // Trae todas las clases (haciendo un JOIN automático para traer el nombre del deporte y del monitor)
    getAllClases: async (): Promise<Clase[]> => {
        const { data, error } = await supabase
            .from('clases')
            .select(`
                *,
                disciplinas(nombre),
                usuarios(nombre, apellidos)
            `)
            .order('fecha', { ascending: true })
            .order('hora_inicio', { ascending: true });

        if (error) throw error;
        return data as Clase[];
    },

    // Para que el Admin cree una clase nueva en el calendario
    createClase: async (claseData: Omit<Clase, 'id_clase' | 'disciplinas' | 'usuarios'>): Promise<Clase> => {
        const { data, error } = await supabase
            .from('clases')
            .insert([claseData])
            .select()
            .single();

        if (error) throw error;
        return data as Clase;
    },

    // Por si el Admin se equivoca y necesita borrar una clase
    deleteClase: async (id_clase: string): Promise<void> => {
        const { error } = await supabase
            .from('clases')
            .delete()
            .eq('id_clase', id_clase);

        if (error) throw error;
    }
};