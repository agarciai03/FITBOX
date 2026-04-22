import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CreditCard, CheckCircle, AlertTriangle, Receipt, Download, X, AlertCircle, Users } from 'lucide-react';
import { PaymentRepository, type Pago } from '../database/repositories/PaymentRepository';
import { useTranslation } from 'react-i18next';

export const PagosPage = () => {
    const { t } = useTranslation();
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isAdminOrMonitor = rol === 'Administrador' || rol === 'Monitor';

    // 100% DATOS REALES DE SUPABASE (Nada de placeholders)
    const estadoPago = (profile as any)?.estado_pago || 'pendiente';
    const tarjetaGuardada = (profile as any)?.metodo_pago || null;

    const [historialPagos, setHistorialPagos] = useState<Pago[]>([]);
    const [isLoadingPagos, setIsLoadingPagos] = useState(true);

    // Estados del Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [titular, setTitular] = useState('');
    const [numero, setNumero] = useState('');
    const [caducidad, setCaducidad] = useState('');
    const [cvc, setCvc] = useState('');

    const [modalError, setModalError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [modalSuccess, setModalSuccess] = useState(false);

    // Cargar pagos 100% reales desde Supabase
    const cargarPagos = async () => {
        if (!profile?.id_usuario) return;
        setIsLoadingPagos(true);
        try {
            let pagos;
            if (isAdminOrMonitor) {
                // Admin/Monitor ve todos los pagos reales del gimnasio
                pagos = await PaymentRepository.getAllPagos();
            } else {
                // Socio ve solo sus pagos reales
                pagos = await PaymentRepository.getPagosBySocio(profile.id_usuario);
            }
            setHistorialPagos(pagos);
        } catch (error) {
            console.error("Error al cargar los pagos:", error);
        } finally {
            setIsLoadingPagos(false);
        }
    };

    useEffect(() => {
        cargarPagos();
    }, [profile?.id_usuario, isAdminOrMonitor]);

    const handleGuardarTarjeta = async () => {
        setModalError(null);
        setModalSuccess(false);

        const numLimpio = numero.replace(/\s/g, '');

        if (titular.trim().length < 3) return setModalError('Nombre de titular no válido.');
        if (numLimpio.length !== 16) return setModalError('Número de tarjeta incompleto.');
        if (caducidad.length !== 5) return setModalError('Formato de fecha inválido (MM/YY).');

        const [mes, anio] = caducidad.split('/');
        const mesNum = parseInt(mes, 10);
        const anioNum = parseInt(anio, 10);
        const fechaActual = new Date();
        const anioActualCorto = fechaActual.getFullYear() % 100;
        const mesActual = fechaActual.getMonth() + 1;

        if (mesNum < 1 || mesNum > 12) return setModalError('Mes no válido.');
        if (anioNum < anioActualCorto || (anioNum === anioActualCorto && mesNum < mesActual)) {
            return setModalError('La tarjeta ya ha caducado.');
        }
        if (cvc.length !== 3) return setModalError('CVC debe tener 3 dígitos.');

        setIsSaving(true);
        try {
            if (profile?.id_usuario) {
                await PaymentRepository.vincularTarjeta(profile.id_usuario, numLimpio, caducidad);
                setModalSuccess(true);
                setTimeout(() => {
                    setShowEditModal(false);
                    setModalSuccess(false);
                    setTitular(''); setNumero(''); setCaducidad(''); setCvc('');
                    // Recargar el perfil para actualizar la vista de la tarjeta
                    window.location.reload();
                }, 2000);
            }
        } catch (err) {
            setModalError('Error al guardar en base de datos.');
        } finally {
            setIsSaving(false);
        }
    };

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

                    <Card className="p-6 bg-fitbox-card border-neutral-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Tarjeta de Cargo</p>
                                {tarjetaGuardada ? (
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="bg-neutral-800 p-2 rounded-md border border-neutral-700">
                                            <CreditCard className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-fitbox-text font-bold font-mono tracking-widest">{tarjetaGuardada}</p>
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <p className="text-gray-400 text-sm italic">No hay tarjeta vinculada.</p>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setShowEditModal(true)} className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">
                                {tarjetaGuardada ? 'Editar' : 'Añadir'}
                            </button>
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

            {/* MODAL EDITAR TARJETA */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card className="max-w-md w-full bg-neutral-950 border-neutral-800 p-8 relative shadow-2xl">
                        <button onClick={() => !isSaving && setShowEditModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Actualizar <span className="text-fitbox-red">Tarjeta</span></h2>
                            <p className="text-xs text-gray-400">Introduce los nuevos datos de facturación.</p>
                        </div>

                        {modalSuccess ? (
                            <div className="py-8 text-center animate-in zoom-in">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
                                <p className="text-white font-bold">¡Datos guardados con éxito!</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {modalError && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {modalError}</div>}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Titular</label>
                                    <Input placeholder="NOMBRE COMPLETO" className="bg-neutral-900 border-neutral-800 uppercase text-white" value={titular} onChange={(e) => setTitular(e.target.value.replace(/[^a-zA-Z\s]/g, ''))} />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Número de Tarjeta</label>
                                    <Input placeholder="0000 0000 0000 0000" className="bg-neutral-900 border-neutral-800 font-mono text-white" maxLength={19} value={numero} onChange={(e) => setNumero(e.target.value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || '')} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Caducidad (MM/YY)</label>
                                        <Input placeholder="MM/YY" className="bg-neutral-900 border-neutral-800 text-center text-white" maxLength={5} value={caducidad} onChange={(e) => {
                                            let v = e.target.value.replace(/\D/g, '');
                                            if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                            setCaducidad(v);
                                        }} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CVC</label>
                                        <Input type="password" placeholder="***" className="bg-neutral-900 border-neutral-800 text-center text-white" maxLength={3} value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))} />
                                    </div>
                                </div>

                                <Button onClick={handleGuardarTarjeta} disabled={isSaving} className="w-full bg-fitbox-red hover:bg-red-700 py-6 mt-4 shadow-lg shadow-fitbox-red/20 font-bold text-white">
                                    {isSaving ? 'GUARDANDO DATOS...' : 'GUARDAR CAMBIOS'}
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};