import { supabase } from '../supabase/Client';
import { type Clase } from './ClassRepository';
import { UserRepository } from './UserRepository'; // <-- AÑADIDO: Importamos el UserRepository

export const AttendanceRepository = {
    // Traer solo las clases donde este usuario es el monitor
    getClasesDelMonitor: async (id_monitor: string): Promise<Clase[]> => {
        const { data, error } = await supabase
            .from('clases')
            .select(`
                *,
                disciplinas(nombre),
                reservas(
                    id, 
                    id_socio, 
                    estado,
                    asistencia,
                    usuarios(nombre, apellidos, email)
                )
            `)
            .eq('id_monitor', id_monitor)
            .order('fecha', { ascending: true })
            .order('hora_inicio', { ascending: true });

        if (error) throw error;
        return data as Clase[];
    },

    // Pasar lista (Marcar si vino o faltó) + LÓGICA XP
    marcarAsistencia: async (id_reserva: string, asistio: boolean): Promise<void> => {
        const { error } = await supabase
            .from('reservas')
            .update({ asistencia: asistio })
            .eq('id', id_reserva);

        if (error) throw error;

        // Si el socio ha asistido a su clase, le premiamos con 50 XP
        if (asistio) {
            try {
                // Buscamos de quién era la reserva en Supabase
                const { data: reserva, error: resError } = await supabase
                    .from('reservas')
                    .select('id_socio')
                    .eq('id', id_reserva)
                    .single();

                // Le inyectamos los puntos de experiencia
                if (!resError && reserva?.id_socio) {
                    await UserRepository.sumarExperiencia(reserva.id_socio, 50);
                }
            } catch (xpError) {
                console.error("La asistencia se guardó, pero hubo un fallo sumando XP", xpError);
            }
        }
    }
};