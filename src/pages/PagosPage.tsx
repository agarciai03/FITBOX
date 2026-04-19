import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CreditCard, CheckCircle, AlertTriangle, Receipt, Download, Calendar, X, AlertCircle } from 'lucide-react';
import { PaymentRepository, type Pago } from '../database/repositories/PaymentRepository'; // Importamos el repositorio

export const PagosPage = () => {
    const profile = useAuthStore((state) => state.profile);

    // Leemos el estado de pago del perfil. Si por algún motivo no existe en BBDD aún, asumimos 'activo' para la demo.
    const estadoPago = (profile as any)?.estado_pago || 'activo';

    // Estado para guardar el historial real de pagos desde Supabase
    const [historialPagos, setHistorialPagos] = useState<Pago[]>([]);
    const [isLoadingPagos, setIsLoadingPagos] = useState(true);

    // --- NUEVO: ESTADOS PARA EL MODAL DE EDITAR TARJETA ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [titular, setTitular] = useState('');
    const [numero, setNumero] = useState('');
    const [caducidad, setCaducidad] = useState('');
    const [cvc, setCvc] = useState('');

    const [modalError, setModalError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [modalSuccess, setModalSuccess] = useState(false);

    // Efecto para cargar los pagos reales del usuario
    useEffect(() => {
        const cargarPagos = async () => {
            if (profile?.id_usuario) {
                try {
                    const pagosReales = await PaymentRepository.getPagosBySocio(profile.id_usuario);
                    setHistorialPagos(pagosReales);
                } catch (error) {
                    console.error("Error al cargar los pagos:", error);
                } finally {
                    setIsLoadingPagos(false);
                }
            }
        };

        cargarPagos();
    }, [profile?.id_usuario]);

    // Calcular fecha del próximo cobro de forma dinámica
    const hoy = new Date();
    const proximoCobro = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    const fechaProximoCobro = proximoCobro.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });


    // --- NUEVO: LÓGICA DE VALIDACIÓN EUROPEA AL GUARDAR ---
    const handleGuardarTarjeta = async () => {
        setModalError(null);
        setModalSuccess(false);

        // 1. Validar Titular
        if (titular.trim().length < 3) {
            setModalError('El nombre del titular debe tener al menos 3 letras.');
            return;
        }

        // 2. Validar Número (quitamos los espacios para contar)
        const numLimpio = numero.replace(/\s/g, '');
        if (numLimpio.length !== 16) {
            setModalError('El número de tarjeta debe tener exactamente 16 dígitos.');
            return;
        }

        // 3. Validar Caducidad (Mes correcto)
        if (caducidad.length !== 5) {
            setModalError('La fecha de caducidad está incompleta (MM/YY).');
            return;
        }
        const [mes, anio] = caducidad.split('/');
        const mesNum = parseInt(mes, 10);
        if (mesNum < 1 || mesNum > 12) {
            setModalError('El mes de caducidad es inválido (01-12).');
            return;
        }

        // 4. Validar CVC
        if (cvc.length !== 3) {
            setModalError('El código de seguridad (CVC) debe tener 3 dígitos.');
            return;
        }

        // 5. Simulación de guardado seguro y actualización en BBDD
        setIsSaving(true);
        try {
            if (profile?.id_usuario) {
                await PaymentRepository.vincularTarjeta(profile.id_usuario, numLimpio, caducidad);
                setModalSuccess(true);
                setTimeout(() => {
                    setShowEditModal(false);
                    setModalSuccess(false);
                    setTitular(''); setNumero(''); setCaducidad(''); setCvc('');
                    // Nota: Aquí se debería refrescar la sesión si queremos que el cambio visual de la tarjeta
                    // se vea instantáneamente, pero para la UI actual es suficiente.
                }, 2000);
            }
        } catch (err) {
            console.error("Error al vincular la tarjeta", err);
            setModalError('Ocurrió un error al procesar la tarjeta.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
            {/* Cabecera */}
            <div>
                <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 uppercase tracking-tight">
                    <CreditCard className="w-8 h-8 text-fitbox-red" />
                    MIS <span className="text-fitbox-red">PAGOS Y FACTURAS</span>
                </h1>
                <p className="text-fitbox-text-muted mt-1">Gestiona tu suscripción y consulta tu historial de recibos.</p>
            </div>

            {/* Tarjetas Superiores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tarjeta de Estado de Membresía */}
                <Card className={`p-6 border-l-4 ${estadoPago === 'activo' ? 'border-l-green-500 bg-green-900/5' : 'border-l-red-500 bg-red-900/5'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Estado de la suscripción</p>
                            <h2 className={`text-3xl font-black uppercase tracking-tighter ${estadoPago === 'activo' ? 'text-green-500' : 'text-fitbox-red'}`}>
                                {estadoPago === 'activo' ? 'ACTIVA' : 'PENDIENTE'}
                            </h2>
                            <p className="text-sm text-gray-400 mt-2">
                                {estadoPago === 'activo'
                                    ? `Tu próxima cuota se cobrará el ${fechaProximoCobro}.`
                                    : 'Tienes un pago pendiente. Actualiza tu método de pago para seguir entrenando.'}
                            </p>
                        </div>
                        <div className={`p-3 rounded-full ${estadoPago === 'activo' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            {estadoPago === 'activo' ? <CheckCircle className="w-8 h-8 text-green-500" /> : <AlertTriangle className="w-8 h-8 text-fitbox-red" />}
                        </div>
                    </div>
                </Card>

                {/* Tarjeta de Método de Pago */}
                <Card className="p-6 bg-fitbox-card border-neutral-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Método de pago actual</p>
                            {estadoPago === 'activo' ? (
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="bg-neutral-800 p-2 rounded-md border border-neutral-700">
                                        <CreditCard className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold font-mono tracking-widest">
                                            {/* Mostramos el método guardado en BBDD si existe, si no un placeholder */}
                                            {(profile as any)?.metodo_pago || '**** **** **** 4242'}
                                        </p>
                                        <p className="text-xs text-gray-500">Tarjeta Vinculada</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <p className="text-gray-400 text-sm italic">No hay ninguna tarjeta vinculada.</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors"
                        >
                            Editar
                        </button>
                    </div>
                </Card>
            </div>

            {/* Tabla de Historial de Pagos REAL */}
            <div className="bg-fitbox-card border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-fitbox-red" /> Historial de Facturación
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-800/50 text-fitbox-text-muted uppercase text-[10px] tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Nº Ref.</th>
                                <th className="px-6 py-4">Concepto</th>
                                <th className="px-6 py-4">Método</th>
                                <th className="px-6 py-4">Importe</th>
                                <th className="px-6 py-4 text-right">Descargar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {isLoadingPagos ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Cargando recibos...</td>
                                </tr>
                            ) : historialPagos.length > 0 ? (
                                historialPagos.map((pago) => (
                                    <tr key={pago.id_pago} className="hover:bg-neutral-800/20 transition-colors">
                                        <td className="px-6 py-4 text-gray-300 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" /> {new Date(pago.fecha_pago).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">FIT-{pago.id_pago.toString().padStart(5, '0')}</td>
                                        <td className="px-6 py-4 font-bold text-white">{pago.concepto}</td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">Stripe Web</td>
                                        <td className="px-6 py-4 font-black text-white">{Number(pago.importe).toFixed(2)} €</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-fitbox-text-muted hover:text-white p-2 rounded-md hover:bg-neutral-800 transition-colors" title="Descargar PDF">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                                        No se han registrado pagos en tu cuenta todavía.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL DE EDITAR TARJETA --- */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <Card className="max-w-md w-full bg-neutral-950 border-neutral-800 p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">

                        {/* Botón de cerrar superior */}
                        <button
                            onClick={() => !isSaving && setShowEditModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                                <CreditCard className="text-fitbox-red w-6 h-6" />
                                Datos de <span className="text-fitbox-red">Facturación</span>
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">Conexión segura 256-bit SSL</p>
                        </div>

                        {modalSuccess ? (
                            <div className="py-8 flex flex-col items-center justify-center animate-in zoom-in space-y-4">
                                <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
                                <p className="text-white font-bold text-lg">¡Tarjeta actualizada correctamente!</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {modalError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg flex items-center gap-2 text-sm font-bold animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" /> {modalError}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Titular de la tarjeta</label>
                                    <Input
                                        placeholder="Nombre y Apellidos"
                                        className="bg-neutral-900 border-neutral-800 uppercase focus:border-fitbox-red text-white"
                                        value={titular}
                                        onChange={(e) => {
                                            // Validación estricta: Solo permite letras y espacios
                                            const valorLimpio = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                            setTitular(valorLimpio);
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Número de Tarjeta</label>
                                    <Input
                                        placeholder="0000 0000 0000 0000"
                                        className="bg-neutral-900 border-neutral-800 font-mono tracking-widest text-lg focus:border-fitbox-red text-white"
                                        value={numero}
                                        onChange={(e) => {
                                            // Eliminamos todo lo que no sea número
                                            const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
                                            // Agrupamos de 4 en 4 automáticamente
                                            const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
                                            setNumero(formatted);
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Caducidad</label>
                                        <Input
                                            placeholder="MM/YY"
                                            className="bg-neutral-900 border-neutral-800 font-mono text-center focus:border-fitbox-red text-white"
                                            value={caducidad}
                                            onChange={(e) => {
                                                // Eliminamos letras y añadimos la barra "/" en el medio
                                                let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
                                                if (raw.length >= 3) {
                                                    raw = raw.substring(0, 2) + '/' + raw.substring(2, 4);
                                                }
                                                setCaducidad(raw);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CVC / CVV</label>
                                        <Input
                                            type="password"
                                            placeholder="•••"
                                            className="bg-neutral-900 border-neutral-800 font-mono text-center tracking-widest focus:border-fitbox-red text-white"
                                            value={cvc}
                                            onChange={(e) => {
                                                // Solo números, máximo 3
                                                setCvc(e.target.value.replace(/\D/g, '').substring(0, 3));
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        onClick={handleGuardarTarjeta}
                                        disabled={isSaving}
                                        className="w-full bg-fitbox-red hover:bg-red-700 text-white font-bold py-6 shadow-lg shadow-fitbox-red/20 transition-all"
                                    >
                                        {isSaving ? 'Conectando con el banco...' : 'Guardar y Encriptar Tarjeta'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};