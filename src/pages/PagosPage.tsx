import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { CheckCircle, AlertTriangle, Receipt, Download, Users, CreditCard } from 'lucide-react';
import { PaymentRepository, type Pago } from '../database/repositories/PaymentRepository';

export const PagosPage = () => {
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isAdminOrMonitor = rol === 'Administrador' || rol === 'Monitor';

    // 100% DATOS REALES DE SUPABASE 
    const estadoPago = (profile as any)?.estado_pago || 'pendiente';

    const [historialPagos, setHistorialPagos] = useState<Pago[]>([]);
    const [isLoadingPagos, setIsLoadingPagos] = useState(true);

    const cargarPagos = useCallback(async () => {
        if (!profile?.id_usuario) return;
        setIsLoadingPagos(true);
        try {
            let pagos;
            if (isAdminOrMonitor) {
                pagos = await PaymentRepository.getAllPagos();
            } else {
                pagos = await PaymentRepository.getPagosBySocio(profile.id_usuario);
            }
            setHistorialPagos(pagos);
        } catch (error) {
            console.error("Error al cargar los pagos:", error);
        } finally {
            setIsLoadingPagos(false);
        }
    }, [profile?.id_usuario, isAdminOrMonitor]);

    useEffect(() => {
        cargarPagos();
    }, [cargarPagos]);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">

            {/* Cabecera */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-fitbox-text flex items-center gap-3 uppercase tracking-tight">
                        <CreditCard className="w-8 h-8 text-fitbox-red" />
                        {isAdminOrMonitor ? 'GESTIÓN DE' : 'MIS'} <span className="text-fitbox-red">PAGOS Y FACTURAS</span>
                    </h1>
                    <p className="text-fitbox-text-muted mt-1">
                        {isAdminOrMonitor
                            ? 'Panel de control financiero y recibos del gimnasio.'
                            : 'Gestiona tu suscripción y consulta tu historial de recibos.'}
                    </p>
                </div>
            </div>

            {/* Tarjetas de estado (Solo para el socio) */}
            {!isAdminOrMonitor && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className={`p-6 border-l-4 transition-colors ${estadoPago === 'activo' ? 'border-l-green-500 bg-green-900/5' : 'border-l-fitbox-red bg-red-900/5'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Tu Estado</p>
                                <h2 className={`text-3xl font-black uppercase tracking-tighter ${estadoPago === 'activo' ? 'text-green-500' : 'text-fitbox-red'}`}>
                                    {estadoPago === 'activo' ? 'MIEMBRO ACTIVO' : 'PAGO PENDIENTE'}
                                </h2>
                                <p className="text-sm text-gray-400 mt-2 italic">
                                    {estadoPago === 'activo' ? 'Todo al día. Gracias por confiar en FITBOX.' : 'No hemos podido procesar tu último pago.'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${estadoPago === 'activo' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                {estadoPago === 'activo' ? <CheckCircle className="w-8 h-8 text-green-500" /> : <AlertTriangle className="w-8 h-8 text-fitbox-red" />}
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Tabla Principal */}
            <div className="bg-fitbox-card border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-fitbox-text flex items-center gap-2">
                        {isAdminOrMonitor ? <Users className="text-fitbox-red" /> : <Receipt className="text-fitbox-red" />}
                        {isAdminOrMonitor ? 'Todos los recibos del gimnasio' : 'Historial de facturación'}
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-800/50 text-fitbox-text-muted uppercase text-[10px] tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                {isAdminOrMonitor && <th className="px-6 py-4">Socio</th>}
                                <th className="px-6 py-4">Concepto</th>
                                <th className="px-6 py-4">Importe</th>
                                <th className="px-6 py-4 text-right">Factura</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {isLoadingPagos ? (
                                <tr><td colSpan={isAdminOrMonitor ? 5 : 4} className="px-6 py-12 text-center text-gray-500">Cargando datos desde la base de datos...</td></tr>
                            ) : historialPagos.length > 0 ? (
                                historialPagos.map((pago) => (
                                    <tr key={pago.id_pago} className="hover:bg-neutral-800/20 transition-colors">
                                        <td className="px-6 py-4 text-gray-300">
                                            {new Date(pago.fecha_pago).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        {isAdminOrMonitor && (
                                            <td className="px-6 py-4 font-bold text-blue-400 capitalize">
                                                {(pago as any).usuarios?.nombre || 'Desconocido'} {(pago as any).usuarios?.apellidos || ''}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 font-medium text-fitbox-text">{pago.concepto}</td>
                                        <td className="px-6 py-4 font-black text-fitbox-text">{Number(pago.importe).toFixed(2)} €</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-500 hover:text-fitbox-text transition-colors" title="Descargar PDF">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={isAdminOrMonitor ? 5 : 4} className="px-6 py-12 text-center text-gray-500 italic">No hay registros de facturación en la base de datos.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};