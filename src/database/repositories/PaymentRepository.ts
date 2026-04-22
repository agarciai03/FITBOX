import { supabase } from '../supabase/Client';

export interface Pago {
    id_pago: number;
    id_usuario: string;
    importe: number;
    concepto: string;
    fecha_pago: string;
    metodo_pago?: string;
    estado_pago?: string;
    usuarios?: {
        nombre: string;
        apellidos: string;
    };
}

export const PaymentRepository = {
    // 1. Traer TODOS los pagos (Para Admin/Monitor) con el nombre del socio cruzado
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

    // 2. Traer solo los pagos de un socio concreto
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

    // 3. Registrar un nuevo recibo de facturación en la base de datos
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
    },

    // 4. Vincular tarjeta real (Guardando máscara y caducidad real en BBDD)
    vincularTarjeta: async (id_usuario: string, numero: string, caducidad: string): Promise<void> => {
        // En un entorno de producción estricto, el número crudo se envía a Stripe y guardamos el token.
        // Aquí guardamos la máscara real de la tarjeta y la caducidad (ahora SÍ se usa) en Supabase.
        const ultimos4 = numero.slice(-4);
        const tarjetaEnmascarada = `**** **** **** ${ultimos4} (Exp: ${caducidad})`;

        const { error } = await supabase
            .from('usuarios')
            .update({
                metodo_pago: tarjetaEnmascarada,
                estado_pago: 'activo'
            })
            .eq('id_usuario', id_usuario);

        if (error) throw error;
    }
};