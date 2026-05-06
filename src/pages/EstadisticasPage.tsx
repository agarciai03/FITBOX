import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../database/supabase/Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, BarChart3, AlertTriangle, Target } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const EstadisticasPage = () => {
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isStaff = rol === 'Administrador' || rol === 'Monitor';

    const [datosIngresos, setDatosIngresos] = useState<{ mes: string; ingresos: number }[]>([]);
    const [datosReservas, setDatosReservas] = useState<{ mes: string; reservas: number }[]>([]);
    const [datosDisciplinas, setDatosDisciplinas] = useState<{ name: string; value: number; color: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isStaff) return;

        const cargarEstadisticas = async () => {
            setIsLoading(true);
            const añoActual = new Date().getFullYear();
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

            // Inicializamos arrays vacíos
            const ingresos = meses.map(m => ({ mes: m, ingresos: 0 }));
            const reservas = meses.map(m => ({ mes: m, reservas: 0 }));

            try {
                // Obtener pagos 
                const { data: pagos } = await supabase.from('pagos').select('importe, fecha_pago');
                if (pagos) {
                    pagos.forEach(pago => {
                        const fecha = new Date(pago.fecha_pago);
                        if (fecha.getFullYear() === añoActual) {
                            ingresos[fecha.getMonth()].ingresos += Number(pago.importe);
                        }
                    });
                }

                // Obtener reservas 
                const { data: reservasData } = await supabase.from('reservas').select('fecha_reserva');
                if (reservasData) {
                    reservasData.forEach(reserva => {
                        const fecha = new Date(reserva.fecha_reserva);
                        if (fecha.getFullYear() === añoActual) {
                            reservas[fecha.getMonth()].reservas += 1;
                        }
                    });
                }

                // Obtener popularidad de disciplinas
                const { data: reservasDataCompleta } = await supabase
                    .from('reservas')
                    .select(`
                        clases (
                            disciplinas (
                                nombre
                            )
                        )
                    `);

                if (reservasDataCompleta) {
                    const conteoDisciplinas: Record<string, number> = {};

                    reservasDataCompleta.forEach((res: any) => {
                        // Navegamos por la relación de la base de datos
                        const nombreDisc = res.clases?.disciplinas?.nombre || 'Otras';
                        conteoDisciplinas[nombreDisc] = (conteoDisciplinas[nombreDisc] || 0) + 1;
                    });

                    // Colores premium para el gráfico (Rojo Fitbox, Azul, Verde, Amarillo, Morado, Naranja)
                    const colores = ['#dc2626', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316'];

                    const dataDisc = Object.keys(conteoDisciplinas).map((key, index) => ({
                        name: key,
                        value: conteoDisciplinas[key],
                        color: colores[index % colores.length]
                    }));

                    // Ordenar de mayor a menor popularidad
                    dataDisc.sort((a, b) => b.value - a.value);
                    setDatosDisciplinas(dataDisc);
                }

                setDatosIngresos(ingresos);
                setDatosReservas(reservas);

            } catch (error) {
                console.error("Error al cargar estadísticas:", error);
            } finally {
                setIsLoading(false);
            }
        };

        cargarEstadisticas();
    }, [isStaff]);

    // Bloqueo de seguridad
    if (!isStaff) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
                <AlertTriangle className="w-20 h-20 text-fitbox-red mb-6 opacity-20" />
                <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Acceso Denegado</h2>
                <p className="text-gray-400">Esta sección contiene datos financieros exclusivos para la dirección.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-350 mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-neutral-800 pb-6">
                <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 uppercase tracking-tight italic">
                    <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-fitbox-red" />
                    CENTRO DE <span className="text-fitbox-red">ESTADÍSTICAS</span>
                </h1>
                <p className="text-fitbox-text-muted mt-2">Métricas en tiempo real sobre el rendimiento y facturación del club.</p>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest animate-pulse">
                    Analizando base de datos...
                </div>
            ) : (
                <div className="space-y-8">

                    {/* INGRESOS + DONUT DISCIPLINAS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* GRÁFICO 1: INGRESOS */}
                        <Card className="bg-neutral-950 border-neutral-800 p-6 shadow-2xl lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-white font-black text-lg uppercase tracking-tight flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-500" /> Facturación Anual
                                    </h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Ingresos por pagos en {new Date().getFullYear()}</p>
                                </div>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={datosIngresos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis dataKey="mes" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}€`} />
                                        <Tooltip
                                            cursor={{ fill: '#262626' }}
                                            contentStyle={{ backgroundColor: '#16181d', border: '1px solid #262626', borderRadius: '8px' }}
                                            itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                                            formatter={(value: any) => [`${value} €`, 'Ingresos']}
                                        />
                                        <Bar dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* POPULARIDAD DISCIPLINAS */}
                        <Card className="bg-neutral-950 border-neutral-800 p-6 shadow-2xl lg:col-span-1">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-white font-black text-lg uppercase tracking-tight flex items-center gap-2">
                                        <Target className="w-5 h-5 text-blue-500" /> Popularidad
                                    </h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">% de asistencia a clases</p>
                                </div>
                            </div>
                            <div className="h-80 w-full flex flex-col items-center justify-center">
                                {datosDisciplinas.length === 0 ? (
                                    <p className="text-gray-500 italic text-sm">Sin datos de reservas</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={datosDisciplinas}
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {datosDisciplinas.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#16181d', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ fontWeight: 'bold' }}
                                                formatter={(value: any) => [`${value} Asistencias`, 'Total']}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a3a3a3' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card>

                    </div>

                    {/* RESERVAS */}
                    <div className="grid grid-cols-1">
                        <Card className="bg-neutral-950 border-neutral-800 p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-white font-black text-lg uppercase tracking-tight flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-fitbox-red" /> Volumen de Reservas
                                    </h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Evolución del tráfico de socios</p>
                                </div>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={datosReservas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis dataKey="mes" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#16181d', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#dc2626', fontWeight: 'bold' }}
                                            formatter={(value: any) => [`${value} Plazas reservadas`, 'Tráfico']}
                                        />
                                        <Area type="monotone" dataKey="reservas" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorReservas)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                </div>
            )}
        </div>
    );
};