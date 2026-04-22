// src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, AlertCircle, Activity, CreditCard, Trophy, Flame, Medal, Clock, Zap } from 'lucide-react';
import { MachineRepository } from '../database/repositories/MachineRepository';
import { supabase } from '../database/supabase/Client';
import { OcupacionChart } from '../components/charts/OcupacionChart'; 

interface ClaseDashboard {
    id_clase: string;
    hora_inicio: string;
    aforo_maximo: number;
    disciplinas: { nombre: string } | null;
    usuarios: { nombre: string } | null;
    reservas: { id: string }[];
}

export const DashboardPage = () => {
    const profile = useAuthStore((state) => state.profile);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    // Contadores de KPIs reales
    const [incidencias, setIncidencias] = useState(0);
    const [sociosCount, setSociosCount] = useState(0);
    const [clasesCount, setClasesCount] = useState(0);
    const [hombresCount, setHombresCount] = useState(0);
    const [mujeresCount, setMujeresCount] = useState(0);

    const [proximasClases, setProximasClases] = useState<ClaseDashboard[]>([]);
    const [isLoadingClases, setIsLoadingClases] = useState(true);

    // --- ESTADOS PARA DATOS REALES DEL HEATMAP ---
    const [datosOcupacion, setDatosOcupacion] = useState<{ hora: string, ocupacion: number }[]>([]);
    const [mensajeOcupacion, setMensajeOcupacion] = useState({ actual: 0, recomendada: '', recomendadaOcup: 0 });

    // --- LÓGICA DE GAMIFICACIÓN RPG (DATOS REALES) ---
    const xpActual = (profile as any)?.xp || 0;
    const nivelActual = (profile as any)?.nivel || 1;
    const xpParaSiguienteNivel = nivelActual * 200;
    const progresoXP = Math.min(100, (xpActual / xpParaSiguienteNivel) * 100);

    let rango = "Novato";
    let colorRango = "text-gray-400";
    if (nivelActual >= 3) { rango = "Guerrero"; colorRango = "text-blue-400"; }
    if (nivelActual >= 6) { rango = "Élite"; colorRango = "text-purple-400"; }
    if (nivelActual >= 10) { rango = "Leyenda"; colorRango = "text-yellow-400"; }

    useEffect(() => {
        // Cargar Incidencias Reales
        MachineRepository.getAllMaquinas().then(data => {
            const maquinasRotas = data.filter(maquina => maquina.estado !== 'Correcto').length;
            setIncidencias(maquinasRotas);
        }).catch(err => console.error("Error al cargar las incidencias en el Dashboard:", err));

        // Cargar KPIs de Usuarios Reales
        const fetchSocios = async () => {
            const { count, error } = await supabase.from('usuarios').select('*', { count: 'exact', head: true });
            if (!error && count !== null) setSociosCount(count);
        };

        const fetchEstadisticasSexos = async () => {
            const { count: h } = await supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('sexo', 'Hombre');
            const { count: m } = await supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('sexo', 'Mujer');
            if (h !== null) setHombresCount(h);
            if (m !== null) setMujeresCount(m);
        };

        // Cargar Clases de Hoy y calcular Heatmap
        const fetchClasesHoy = async () => {
            setIsLoadingClases(true);
            const hoy = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('clases')
                .select(`
                    id_clase,
                    hora_inicio,
                    aforo_maximo,
                    disciplinas ( nombre ),
                    usuarios ( nombre ),
                    reservas ( id )
                `)
                .eq('fecha', hoy)
                .order('hora_inicio', { ascending: true });

            if (!error && data) {
                setClasesCount(data.length);

                // Extraer próximas clases para la lista inferior (solo las futuras o las 4 primeras)
                setProximasClases(data.slice(0, 4) as unknown as ClaseDashboard[]);

                // --- ALGORITMO DE HEATMAP REAL ---
                // 1. Creamos tramos horarios (buckets)
                const buckets = [8, 10, 12, 14, 16, 18, 20, 22];
                const ocupacionArr = buckets.map(b => ({
                    hora: `${b < 10 ? '0' + b : b}:00`,
                    ocupacion: 0,
                    plazas: 0,
                    reservas: 0
                }));

                // 2. Repartimos las clases reales en los tramos horarios
                data.forEach((clase: any) => {
                    if (!clase.hora_inicio) return;
                    const horaNum = parseInt(clase.hora_inicio.split(':')[0], 10);

                    // Buscamos el bloque horario más cercano
                    let bucketVal = horaNum % 2 === 0 ? horaNum : horaNum - 1;
                    if (bucketVal < 8) bucketVal = 8;
                    if (bucketVal > 22) bucketVal = 22;

                    const bucketObj = ocupacionArr.find(b => b.hora === `${bucketVal < 10 ? '0' + bucketVal : bucketVal}:00`);
                    if (bucketObj) {
                        bucketObj.plazas += (clase.aforo_maximo || 20);
                        bucketObj.reservas += (clase.reservas ? clase.reservas.length : 0);
                    }
                });

                // 3. Calculamos el % real de ocupación
                ocupacionArr.forEach(item => {
                    if (item.plazas > 0) {
                        item.ocupacion = Math.round((item.reservas / item.plazas) * 100);
                    }
                });
                setDatosOcupacion(ocupacionArr);

                // 4. Inteligencia Artificial para recomendación
                const horaActualNum = new Date().getHours();
                let bucketActual = horaActualNum % 2 === 0 ? horaActualNum : horaActualNum - 1;
                if (bucketActual < 8) bucketActual = 8;
                if (bucketActual > 22) bucketActual = 22;

                const actualObj = ocupacionArr.find(b => b.hora === `${bucketActual < 10 ? '0' + bucketActual : bucketActual}:00`);
                const ocupacionActual = actualObj ? actualObj.ocupacion : 0;

                // Buscamos la hora menos ocupada hacia adelante en el día
                let mejorHora = '';
                let menorOcupacion = 100;
                ocupacionArr.forEach(item => {
                    const itemHoraNum = parseInt(item.hora.split(':')[0], 10);
                    if (itemHoraNum > horaActualNum && item.ocupacion <= menorOcupacion) {
                        menorOcupacion = item.ocupacion;
                        mejorHora = item.hora;
                    }
                });

                if (!mejorHora) { // Si ya es muy tarde, sugerimos mañana
                    mejorHora = '08:00 (Mañana)';
                    menorOcupacion = 0;
                }

                setMensajeOcupacion({
                    actual: ocupacionActual,
                    recomendada: mejorHora,
                    recomendadaOcup: menorOcupacion
                });
            }
            setIsLoadingClases(false);
        };

        fetchSocios();
        fetchEstadisticasSexos();
        fetchClasesHoy();
    }, []);

    return (
        <div className="p-6 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

            {/* 1. TÍTULO Y BIENVENIDA */}
            <div>
                <h1 className="text-3xl font-extrabold text-fitbox-text">
                    Hola, <span className="text-fitbox-red capitalize">{profile?.nombre || user?.email?.split('@')[0]}</span>
                </h1>
                <p className="text-fitbox-text-muted mt-1">Este es el resumen de tu centro deportivo hoy.</p>
            </div>

            {/* ESTADO DE SUSCRIPCIÓN */}
            {profile?.roles?.nombre_rol === 'Socio' && (
                <Card className={`p-6 flex flex-col justify-center items-center border ${(profile as any)?.estado_pago === 'activo' ? 'bg-green-900/10 border-green-500/30' : 'bg-red-900/10 border-red-500/30'}`}>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" /> Estado de Suscripción
                    </h3>
                    <p className={`text-4xl font-black uppercase tracking-tighter ${(profile as any)?.estado_pago === 'activo' ? 'text-green-500' : 'text-fitbox-red'}`}>
                        {(profile as any)?.estado_pago === 'activo' ? 'ACTIVA' : 'PENDIENTE DE PAGO'}
                    </p>
                </Card>
            )}

            {/* 2. MÓDULOS DE GAMIFICACIÓN Y HEATMAP REAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* GAMIFICACIÓN REAL */}
                <div className="lg:col-span-2 bg-fitbox-card border border-neutral-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-fitbox-red/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="bg-neutral-900 border border-neutral-700 p-3 rounded-xl shadow-lg">
                                    <Trophy className={`w-8 h-8 ${colorRango}`} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-fitbox-text italic uppercase tracking-tighter">
                                        Nivel {nivelActual} <span className={colorRango}>• {rango}</span>
                                    </h2>
                                    <p className="text-fitbox-text-muted text-xs font-bold uppercase tracking-widest">
                                        Puntos de Experiencia (XP)
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-fitbox-red">{xpActual}</span>
                                <span className="text-gray-500 text-sm"> / {xpParaSiguienteNivel} XP</span>
                            </div>
                        </div>

                        <div className="w-full h-3 bg-neutral-900 rounded-full border border-neutral-800 overflow-hidden mt-4">
                            <div
                                className="h-full bg-linear-to-r from-fitbox-red to-orange-500 transition-all duration-1000 ease-out relative"
                                style={{ width: `${progresoXP}%` }}
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-neutral-800/50">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Medal className="w-4 h-4" /> Tus Logros Desbloqueados
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${nivelActual >= 2 ? 'bg-neutral-900 border-yellow-500/30 text-fitbox-text' : 'bg-neutral-900/50 border-neutral-800 text-gray-600 opacity-50'}`}>
                                <Clock className={`w-6 h-6 mb-2 ${nivelActual >= 2 ? 'text-yellow-500' : ''}`} />
                                <span className="text-[10px] font-black uppercase text-center">Madrugador</span>
                            </div>
                            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${xpActual >= 500 ? 'bg-neutral-900 border-fitbox-red/30 text-fitbox-text' : 'bg-neutral-900/50 border-neutral-800 text-gray-600 opacity-50'}`}>
                                <Flame className={`w-6 h-6 mb-2 ${xpActual >= 500 ? 'text-fitbox-red' : ''}`} />
                                <span className="text-[10px] font-black uppercase text-center">Inmortal (10x)</span>
                            </div>
                            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border bg-neutral-900/50 border-neutral-800 text-gray-600 opacity-50`}>
                                <Zap className="w-6 h-6 mb-2" />
                                <span className="text-[10px] font-black uppercase text-center">Tester</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HEATMAP Y RECOMENDADOR REAL */}
                <div className="bg-fitbox-card border border-neutral-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-fitbox-text font-black text-lg uppercase tracking-tight flex items-center gap-2 mb-1">
                            <Activity className="w-5 h-5 text-fitbox-red" /> Estado de la Sala
                        </h3>

                        {/* Mensaje dinámico basado en la base de datos real */}
                        <div className={`p-3 border rounded-lg mb-4 ${mensajeOcupacion.actual > 70 ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                            <p className="text-sm font-medium text-fitbox-text">
                                {mensajeOcupacion.actual > 70 ? (
                                    <><span className="text-fitbox-red font-bold">⚠️ Muy lleno.</span> La sala está al <span className="font-bold">{mensajeOcupacion.actual}%</span>.</>
                                ) : (
                                    <><span className="text-green-500 font-bold">✅ Tranquilo.</span> Ocupación actual: <span className="font-bold">{mensajeOcupacion.actual}%</span>.</>
                                )}
                                {' '}Mejor vente a las <span className="font-bold text-white bg-neutral-800 px-1 rounded">{mensajeOcupacion.recomendada}</span> (Aprox. {mensajeOcupacion.recomendadaOcup}%).
                            </p>
                        </div>
                    </div>

                    {/* LLAMADA A TU NUEVO COMPONENTE DE GRÁFICA */}
                    <OcupacionChart data={datosOcupacion} />

                </div>
            </div>

            {/* 3. TARJETAS DE MÉTRICAS (Las que ya tenías) */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="bg-fitbox-card border-neutral-800 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">SOCIOS</span>
                        <Users className="h-5 w-5 text-fitbox-red" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-fitbox-text">{sociosCount}</div>
                    </CardContent>
                </Card>

                <Card className="bg-fitbox-card border-neutral-800 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">CLASES HOY</span>
                        <Calendar className="h-5 w-5 text-fitbox-red" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-fitbox-text">{clasesCount}</div>
                    </CardContent>
                </Card>

                <Card className="bg-fitbox-card border-neutral-800 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">INCIDENCIAS</span>
                        <AlertCircle className={`h-5 w-5 ${incidencias > 0 ? 'text-red-500' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${incidencias > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {incidencias}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-fitbox-card border-neutral-800 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">HOMBRES</span>
                        <Activity className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-fitbox-text">{hombresCount}</div>
                    </CardContent>
                </Card>

                <Card className="bg-fitbox-card border-neutral-800 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">MUJERES</span>
                        <Activity className="h-5 w-5 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-fitbox-text">{mujeresCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* 4. HORARIO Y ACCESOS (Lo que ya tenías) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-fitbox-card p-5 rounded-xl border border-neutral-800 shadow-xl">
                    <h3 className="text-fitbox-text font-bold mb-4">Próximas Clases</h3>
                    <div className="space-y-4">
                        {isLoadingClases ? (
                            <p className="text-gray-500 text-sm">Cargando horario...</p>
                        ) : proximasClases.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No hay clases programadas para el día de hoy.</p>
                        ) : (
                            proximasClases.map((clase) => {
                                const disciplina = clase.disciplinas?.nombre || 'Clase General';
                                const monitor = clase.usuarios?.nombre || 'Sin asignar';
                                const horaFormateada = clase.hora_inicio ? clase.hora_inicio.substring(0, 5) : '--:--';
                                const ocupacion = clase.reservas ? clase.reservas.length : 0;
                                const maximo = clase.aforo_maximo || 20;
                                const estaLlena = ocupacion >= maximo;

                                return (
                                    <div key={clase.id_clase} className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                                        <div>
                                            <p className="text-fitbox-text font-medium">{disciplina}</p>
                                            <p className="text-xs text-gray-500">{horaFormateada} - Monitor: {monitor}</p>
                                        </div>
                                        <span className={`font-bold text-sm ${estaLlena ? 'text-fitbox-red' : 'text-green-500'}`}>
                                            {ocupacion}/{maximo} plazas
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <Button onClick={() => navigate('/clases')} className="w-full h-16 bg-fitbox-red hover:bg-red-700 text-white font-bold text-lg shadow-lg">
                        RESERVAR CLASE
                    </Button>
                    <Button onClick={() => navigate('/maquinas')} className="w-full h-16 bg-neutral-800 hover:bg-neutral-700 text-fitbox-text font-bold text-lg border border-neutral-700 shadow-lg">
                        INVENTARIO / MÁQUINAS
                    </Button>
                </div>
            </div>
        </div>
    );
};