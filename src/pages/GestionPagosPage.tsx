import { useState, useEffect } from 'react';
import { PaymentRepository, type Pago } from '../database/repositories/PaymentRepository';
import { UserRepository, type Usuario } from '../database/repositories/UserRepository';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CreditCard, Search, Plus, X, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export const GestionPagosPage = () => {
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [socios, setSocios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');

    // Estados para el Modal de Cobro
    const [showModal, setShowModal] = useState(false);
    const [socioId, setSocioId] = useState('');
    const [importe, setImporte] = useState('19.99');
    const [concepto, setConcepto] = useState('Cuota Mensual');

    // Estados para la Tarjeta (Validaciones Europeas)
    const [numTarjeta, setNumTarjeta] = useState('');
    const [caducidad, setCaducidad] = useState('');
    const [cvc, setCvc] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [dataPagos, dataSocios] = await Promise.all([
                PaymentRepository.getAllPagos(),
                UserRepository.getAllUsers()
            ]);
            setPagos(dataPagos);
            setSocios(dataSocios.filter(u => u.id_rol === 3)); // Solo socios
        } catch (errorCatch) {
            // Usamos la variable para que TS no diga que "nunca se usa"
            console.error("Error al cargar la caja:", errorCatch);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const handleCobrar = async () => {
        setError(null);
        if (!socioId) return setError("Selecciona un socio.");

        // REGEX VALIDACIONES
        const numLimpio = numTarjeta.replace(/\s/g, '');
        if (numLimpio.length !== 16) return setError("Tarjeta inválida (16 dígitos).");
        if (!/^\d{2}\/\d{2}$/.test(caducidad)) return setError("Caducidad inválida (MM/YY).");
        if (cvc.length !== 3) return setError("CVC inválido (3 dígitos).");

        try {
            await PaymentRepository.registrarPago(socioId, parseFloat(importe), concepto);
            setSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                setSuccess(false);
                setNumTarjeta(''); setCaducidad(''); setCvc('');
                cargarDatos();
            }, 2000);
        } catch (errorCatch) {
            console.error("Fallo en la transacción:", errorCatch);
            setError("Error al procesar el cobro.");
        }
    };

    // Si el usuario no tiene nombre en la base de datos, usamos un string vacío para no romper el toLowerCase()
    const pagosFiltrados = pagos.filter(p => {
        const nombre = p.usuarios?.nombre || '';
        const apellidos = p.usuarios?.apellidos || '';
        return nombre.toLowerCase().includes(filtro.toLowerCase()) ||
            apellidos.toLowerCase().includes(filtro.toLowerCase());
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3 uppercase italic">
                        <CreditCard className="text-fitbox-red w-8 h-8" /> CONTROL DE <span className="text-fitbox-red">CAJA</span>
                    </h1>
                    <p className="text-fitbox-text-muted">Historial de cobros y emisión de recibos manuales.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-fitbox-red hover:bg-red-700 font-bold">
                    <Plus className="w-5 h-5 mr-2" /> REGISTRAR COBRO
                </Button>
            </div>

            <div className="flex gap-4 bg-fitbox-card p-4 rounded-xl border border-neutral-800">
                <Search className="text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar por nombre de socio..."
                    className="bg-transparent border-none text-white w-full outline-none"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                />
            </div>

            <div className="bg-fitbox-card border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-800/50 text-fitbox-text-muted uppercase text-[10px] tracking-widest font-bold">
                        <tr>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Socio</th>
                            <th className="px-6 py-4">Concepto</th>
                            <th className="px-6 py-4">Importe</th>
                            <th className="px-6 py-4 text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Cargando transacciones...</td></tr>
                        ) : pagosFiltrados.map(p => (
                            <tr key={p.id_pago} className="hover:bg-neutral-800/20 transition-colors">
                                <td className="px-6 py-4 text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-fitbox-red" />
                                        {new Date(p.fecha_pago).toLocaleDateString('es-ES')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-white uppercase">{p.usuarios?.nombre} {p.usuarios?.apellidos}</td>
                                <td className="px-6 py-4 text-gray-400 italic">{p.concepto}</td>
                                <td className="px-6 py-4 font-black text-white text-lg">{Number(p.importe).toFixed(2)}€</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        COMPLETADO
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {!loading && pagosFiltrados.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No hay transacciones registradas.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL COBRAR */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <Card className="max-w-md w-full p-8 border-neutral-800 bg-neutral-950 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Pasarela de <span className="text-fitbox-red">Cobro</span></h2>
                            <button onClick={() => setShowModal(false)}><X className="text-gray-500 hover:text-white" /></button>
                        </div>

                        {success ? (
                            <div className="py-12 flex flex-col items-center animate-in zoom-in">
                                <CheckCircle className="w-20 h-20 text-green-500 mb-4 animate-bounce" />
                                <p className="text-white font-black text-center uppercase">¡Transacción Exitosa!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Socio</label>
                                    <select
                                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                        value={socioId}
                                        onChange={(e) => setSocioId(e.target.value)}
                                    >
                                        <option value="">Selecciona Socio...</option>
                                        {/* HEMOS ELIMINADO EL DNI DE AQUÍ PARA EVITAR EL ERROR */}
                                        {socios.map(s => <option key={s.id_usuario} value={s.id_usuario}>{s.nombre} {s.apellidos}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Importe (€)</label>
                                        <Input type="number" value={importe} onChange={(e) => setImporte(e.target.value)} className="bg-neutral-900 border-neutral-800 font-bold text-fitbox-red" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Concepto</label>
                                        <Input value={concepto} onChange={(e) => setConcepto(e.target.value)} className="bg-neutral-900 border-neutral-800 text-xs" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-neutral-900">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Datos de Tarjeta</label>
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="0000 0000 0000 0000"
                                            value={numTarjeta}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
                                                setNumTarjeta(raw.match(/.{1,4}/g)?.join(' ') || raw);
                                            }}
                                            className="bg-neutral-900 border-neutral-800 font-mono tracking-widest text-center"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                placeholder="MM/YY"
                                                value={caducidad}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
                                                    if (raw.length >= 3) raw = raw.substring(0, 2) + '/' + raw.substring(2, 4);
                                                    setCaducidad(raw);
                                                }}
                                                className="bg-neutral-900 border-neutral-800 text-center"
                                            />
                                            <Input
                                                placeholder="CVC"
                                                type="password"
                                                value={cvc}
                                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                                className="bg-neutral-900 border-neutral-800 text-center"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={handleCobrar} className="w-full bg-fitbox-red py-6 font-black text-lg mt-4 shadow-lg shadow-fitbox-red/20">
                                    CONFIRMAR PAGO
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};