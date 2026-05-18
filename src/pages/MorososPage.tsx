import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../database/supabase/Client';
import { Card } from '../components/ui/Card';
import { AlertTriangle, Users, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PaymentRepository } from '../database/repositories/PaymentRepository';

interface SocioMoroso {
    id_usuario: string;
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
    estado_pago: string;
}

export const MorososPage = () => {
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isStaff = rol === 'Administrador' || rol === 'Monitor';

    const [morosos, setMorosos] = useState<SocioMoroso[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [procesandoId, setProcesandoId] = useState<string | null>(null);

    const cargarMorosos = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('id_usuario, nombre, apellidos, email, telefono, estado_pago')
                .eq('id_rol', 3)
                .neq('estado_pago', 'activo')
                .order('nombre', { ascending: true });

            if (error) throw error;
            setMorosos(data as SocioMoroso[]);
        } catch (error) {
            console.error("Error al cargar morosos:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isStaff) {
            cargarMorosos();
        }
    }, [isStaff, cargarMorosos]);

    const handleRegistrarCobro = async (idUsuario: string) => {
        if (!window.confirm("¿Confirmas que has recibido el pago de la mensualidad de este socio en recepción?")) return;

        setProcesandoId(idUsuario);
        try {
            await PaymentRepository.registrarPago(idUsuario, 19.99, "Membresía Mensual (Cobro en Recepción)");
            await cargarMorosos();
        } catch (error) {
            console.error("Error al procesar cobro manual:", error);
        } finally {
            setProcesandoId(null);
        }
    };

    if (!isStaff) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
                <AlertTriangle className="w-20 h-20 text-fitbox-red mb-4" />
                <h2 className="text-3xl font-black text-white">ACCESO DENEGADO</h2>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 uppercase tracking-tight">
                        <AlertTriangle className="w-8 h-8 text-fitbox-red" />
                        CONTROL DE <span className="text-fitbox-red">MOROSIDAD</span>
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Listado de socios con cuotas pendientes o acceso suspendido.
                    </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl flex items-center gap-3">
                    <Users className="w-5 h-5 text-fitbox-red" />
                    <div>
                        <p className="text-[10px] font-bold uppercase text-gray-500">Total Pendientes</p>
                        <p className="text-xl font-black text-fitbox-red leading-none">{morosos.length}</p>
                    </div>
                </div>
            </div>

            <Card className="bg-neutral-950 border border-neutral-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-900/80 text-gray-400 uppercase text-[10px] tracking-widest font-bold border-b border-neutral-800">
                            <tr>
                                <th className="px-6 py-4">Socio</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {isLoading ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Cargando datos...</td></tr>
                            ) : morosos.length > 0 ? (
                                morosos.map((socio) => (
                                    <tr key={socio.id_usuario} className="hover:bg-neutral-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-white font-bold capitalize">{socio.nombre} {socio.apellidos}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-300">{socio.email}</p>
                                            <p className="text-gray-500 text-xs">{socio.telefono || 'Sin teléfono'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">
                                                {socio.estado_pago || 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                onClick={() => handleRegistrarCobro(socio.id_usuario)}
                                                disabled={procesandoId === socio.id_usuario}
                                                className="bg-fitbox-red hover:bg-red-700 text-white font-bold"
                                                size="sm"
                                            >
                                                <CreditCard className="w-4 h-4 mr-2" />
                                                {procesandoId === socio.id_usuario ? 'Procesando...' : 'Cobrar Cuota'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <CheckCircle className="w-12 h-12 text-green-500 mb-3 opacity-50" />
                                            <p className="text-gray-400 font-bold text-lg">¡Buenas noticias!</p>
                                            <p className="text-gray-500 text-sm">Todos los socios están al corriente de pago.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};