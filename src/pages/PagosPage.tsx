import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CheckCircle, AlertTriangle, Receipt, Download, Users, CreditCard, AlertCircle } from 'lucide-react';
import { PaymentRepository, type Pago } from '../database/repositories/PaymentRepository';

interface PaymentFormInputs {
    cardNumber: string;
    expiry: string;
    cvc: string;
}

export const PagosPage = () => {
    const profile = useAuthStore((state) => state.profile);
    const { checkSession } = useAuthStore();
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isAdminOrMonitor = rol === 'Administrador' || rol === 'Monitor';

    const estadoPago = (profile as any)?.estado_pago || 'pendiente';

    const [historialPagos, setHistorialPagos] = useState<Pago[]>([]);
    const [isLoadingPagos, setIsLoadingPagos] = useState(true);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<PaymentFormInputs>();
    const [loadingPay, setLoadingPay] = useState(false);
    const [errorPay, setErrorPay] = useState<string | null>(null);
    const [successPay, setSuccessPay] = useState(false);

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

    const onSubmitPay = async (data: PaymentFormInputs) => {
        setErrorPay(null);
        setLoadingPay(true);

        setTimeout(async () => {
            const cleanCard = data.cardNumber.replace(/\s/g, '');
            if (cleanCard === '4242424242424242') {
                setSuccessPay(true);
                try {
                    await PaymentRepository.registrarPago(profile!.id_usuario, 19.99, "Membresía Mensual FITBOX");

                    setTimeout(() => {
                        checkSession();
                        cargarPagos();
                        setSuccessPay(false);
                    }, 2500);
                } catch (err) {
                    console.error("Error al procesar alta de pago:", err);
                }
            } else {
                setErrorPay('Tarjeta denegada. Usa la tarjeta de prueba: 4242 4242 4242 4242');
                setLoadingPay(false);
            }
        }, 2000);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
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

            {!isAdminOrMonitor && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className={`p-6 border-l-4 transition-colors ${estadoPago === 'activo' ? 'border-l-green-500 bg-green-900/5' : 'border-l-fitbox-red bg-red-900/5'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Tu Estado Actual</p>
                                <h2 className={`text-3xl font-black uppercase tracking-tighter ${estadoPago === 'activo' ? 'text-green-500' : 'text-fitbox-red'}`}>
                                    {estadoPago === 'activo' ? 'MIEMBRO ACTIVO' : 'CUOTA PENDIENTE'}
                                </h2>
                                <p className="text-sm text-gray-400 mt-2 italic">
                                    {estadoPago === 'activo' ? 'Todo al día. Gracias por confiar en FITBOX.' : 'Tu acceso está temporalmente suspendido. Renueva tu cuota para desbloquear la plataforma.'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${estadoPago === 'activo' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                {estadoPago === 'activo' ? <CheckCircle className="w-8 h-8 text-green-500" /> : <AlertTriangle className="w-8 h-8 text-fitbox-red" />}
                            </div>
                        </div>
                    </Card>

                    {estadoPago !== 'activo' && (
                        <Card className="p-6 bg-neutral-950 border border-neutral-800 shadow-xl relative overflow-hidden">
                            {successPay ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-950/90 z-10 animate-in fade-in">
                                    <CheckCircle className="w-16 h-16 text-green-400 mb-4 animate-bounce" />
                                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">¡Pago Completado!</h3>
                                    <p className="text-green-300 text-sm mt-2">Activando tu cuenta...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6 flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><CreditCard className="text-fitbox-red w-5 h-5" /> Pasarela Segura</h3>
                                        <span className="text-2xl font-black text-fitbox-red">19.99 €</span>
                                    </div>

                                    {errorPay && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg mb-4 flex items-center gap-2 text-xs font-bold"><AlertCircle className="w-4 h-4 shrink-0" /> {errorPay}</div>}

                                    <form onSubmit={handleSubmit(onSubmitPay)} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Número de tarjeta</label>
                                            <Input
                                                placeholder="0000 0000 0000 0000"
                                                maxLength={19}
                                                className={`bg-neutral-900 border-neutral-800 text-base tracking-widest font-mono text-white ${errors.cardNumber ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                                {...register("cardNumber", {
                                                    required: "El número es obligatorio",
                                                    pattern: { value: /^(\d{4}\s?){4}$/, message: "Deben ser 16 dígitos numéricos" },
                                                    onChange: (e) => {
                                                        let val = e.target.value.replace(/\D/g, '');
                                                        val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                                                        setValue("cardNumber", val, { shouldValidate: true });
                                                    }
                                                })}
                                            />
                                            {errors.cardNumber && <span className="text-[10px] text-red-500 font-medium">{errors.cardNumber.message}</span>}
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="space-y-1 flex-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Caducidad</label>
                                                <Input
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                    className={`bg-neutral-900 border-neutral-800 font-mono text-white ${errors.expiry ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                                    {...register("expiry", {
                                                        required: "Obligatorio",
                                                        pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: "Formato MM/YY válido" },
                                                        onChange: (e) => {
                                                            let val = e.target.value.replace(/\D/g, '');
                                                            if (val.length >= 2) {
                                                                val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                            }
                                                            setValue("expiry", val, { shouldValidate: true });
                                                        }
                                                    })}
                                                />
                                                {errors.expiry && <span className="text-[10px] text-red-500 font-medium">{errors.expiry.message}</span>}
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CVC</label>
                                                <Input
                                                    placeholder="123"
                                                    maxLength={4}
                                                    type="password"
                                                    className={`bg-neutral-900 border-neutral-800 font-mono text-white ${errors.cvc ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                                    {...register("cvc", {
                                                        required: "Obligatorio",
                                                        pattern: { value: /^\d{3,4}$/, message: "3 o 4 dígitos" },
                                                        onChange: (e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            setValue("cvc", val, { shouldValidate: true });
                                                        }
                                                    })}
                                                />
                                                {errors.cvc && <span className="text-[10px] text-red-500 font-medium">{errors.cvc.message}</span>}
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={loadingPay} className="w-full bg-fitbox-red hover:bg-red-700 text-white font-black py-6 mt-2 shadow-lg shadow-fitbox-red/20">
                                            {loadingPay ? 'Procesando con Stripe...' : 'Abonar Mensualidad'}
                                        </Button>
                                    </form>
                                </>
                            )}
                        </Card>
                    )}
                </div>
            )}

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
                                <tr><td colSpan={isAdminOrMonitor ? 5 : 4} className="px-6 py-12 text-center text-gray-500">Cargando datos...</td></tr>
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