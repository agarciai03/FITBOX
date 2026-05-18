import type { Pago } from '../../interfaces/types';
import { supabase } from '../supabase/Client';
export type { Pago };

export const PaymentRepository = {
    getAllPagos: async (): Promise<Pago[]> => {
        const { data, error } = await supabase
            .from('pagos')
            .select(`
                *,
                usuarios (nombre, apellidos)
            `)
            .order('fecha_pago', { ascending: false });

        if (error) throw error;
        return data as Pago[];
    },

    getPagosBySocio: async (id_usuario: string): Promise<Pago[]> => {
        const { data, error } = await supabase
            .from('pagos')
            .select(`
                *,
                usuarios (nombre, apellidos)
            `)
            .eq('id_usuario', id_usuario)
            .order('fecha_pago', { ascending: false });

        if (error) throw error;
        return data as Pago[];
    },

    registrarPago: async (id_usuario: string, importe: number, concepto: string): Promise<void> => {
        const { error } = await supabase
            .from('pagos')
            .insert([{
                id_usuario,
                importe,
                concepto,
                metodo_pago: 'Stripe Web',
                estado_pago: 'completado'
            }]);

        if (error) throw error;
    }
};