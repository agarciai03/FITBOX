import { supabase } from '../supabase/Client';

export interface Pago {
    id_pago: number;
    id_socio: string;
    importe: number;
    fecha_pago: string;
    concepto: string;
    usuarios?: { nombre: string; apellidos: string }; // Para el join
}

export const PaymentRepository = {
    // 1. Traer todos los pagos (Para Admin/Monitor)
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

    // 2. Traer pagos de un socio específico
    getPagosBySocio: async (id_socio: string): Promise<Pago[]> => {
        const { data, error } = await supabase
            .from('pagos')
            .select('*')
            .eq('id_socio', id_socio)
            .order('fecha_pago', { ascending: false });

        if (error) throw error;
        return data as Pago[];
    },

    // 3. Registrar un nuevo cobro manual
    registrarPago: async (id_socio: string, importe: number, concepto: string): Promise<void> => {
        const fechaHoy = new Date().toISOString().split('T')[0];

        // Insertamos el recibo
        const { error: errorPago } = await supabase
            .from('pagos')
            .insert([{ id_socio, importe, fecha_pago: fechaHoy, concepto }]);

        if (errorPago) throw errorPago;

        // Actualizamos al socio como 'activo' automáticamente al cobrarle
        const { error: errorUser } = await supabase
            .from('usuarios')
            .update({ estado_pago: 'activo' })
            .eq('id_usuario', id_socio);

        if (errorUser) throw errorUser;
    },

    // 4. Vincular tarjeta (Simulación Stripe)
    vincularTarjeta: async (id_socio: string, numeroTarjeta: string, caducidad: string): Promise<void> => {
        const ultimos4 = numeroTarjeta.slice(-4);
        const tarjetaSegura = `**** ${ultimos4}`;

        const { error } = await supabase
            .from('usuarios')
            .update({
                estado_pago: 'activo',
                metodo_pago: tarjetaSegura,
                fecha_caducidad_tarjeta: caducidad
            })
            .eq('id_usuario', id_socio);

        if (error) throw error;
    }
};