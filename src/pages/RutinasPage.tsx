import { useState, useEffect, useCallback } from 'react';
import { ClassRepository, type Disciplina, type Rutina } from '../database/repositories/ClassRepository';
import { supabase } from '../database/supabase/Client';
import { useAuthStore } from '../store/authStore';
import { Dumbbell, Activity, Plus, Trash2, X, Save, AlertTriangle, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

// Lógica para ordenar los días de la semana
const ORDEN_DIAS: Record<string, number> = {
    'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7
};

export const RutinasPage = () => {
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isAdminOrMonitor = rol === 'Administrador' || rol === 'Monitor';

    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [rutinas, setRutinas] = useState<Rutina[]>([]);
    const [disciplinaSeleccionada, setDisciplinaSeleccionada] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const [nuevaRutina, setNuevaRutina] = useState({
        dia_semana: 'Lunes',
        titulo: '',
        descripcion: ''
    });

    useEffect(() => {
        ClassRepository.getAllDisciplinas()
            .then(data => {
                setDisciplinas(data);
                if (data.length > 0) setDisciplinaSeleccionada(data[0].id_disciplina);
            })
            .catch(errorCatch => {
                console.error("Fallo al cargar disciplinas:", errorCatch);
                setError('Error al cargar la lista de disciplinas.');
            });
    }, []);

    const cargarRutinas = useCallback(async (id_disciplina: string) => {
        if (!id_disciplina) return;
        try {
            const data = await ClassRepository.getRutinasByDisciplina(id_disciplina);
            const rutinasOrdenadas = [...data].sort((a, b) => {
                return (ORDEN_DIAS[a.dia_semana] || 8) - (ORDEN_DIAS[b.dia_semana] || 8);
            });
            setRutinas(rutinasOrdenadas);
        } catch (errorCatch) {
            console.error("Fallo en rutinas:", errorCatch);
            setError("No se pudieron cargar las rutinas de esta disciplina.");
        }
    }, []);

    useEffect(() => {
        cargarRutinas(disciplinaSeleccionada);
    }, [disciplinaSeleccionada, cargarRutinas]);

    const handleCrearRutina = async () => {
        setModalError(null);

        const tituloLimpio = nuevaRutina.titulo.trim();
        const descLimpia = nuevaRutina.descripcion.trim();

        if (!tituloLimpio || !descLimpia) {
            setModalError("El título y la descripción de los ejercicios son obligatorios.");
            return;
        }

        setIsSaving(true);
        try {
            const { error: dbError } = await supabase.from('rutinas').insert([{
                id_disciplina: disciplinaSeleccionada,
                dia_semana: nuevaRutina.dia_semana,
                titulo: tituloLimpio,
                descripcion: descLimpia
            }]);

            if (dbError) throw dbError;

            setShowModal(false);
            setNuevaRutina({ dia_semana: 'Lunes', titulo: '', descripcion: '' });
            cargarRutinas(disciplinaSeleccionada);

        } catch (err: any) {
            console.error("Error al crear rutina:", err);
            setModalError("Hubo un error al guardar la rutina en la base de datos.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleBorrarRutina = async (id_rutina: string, titulo: string) => {
        if (!window.confirm(`¿Estás seguro de que quieres borrar el plan de entrenamiento: "${titulo}"?`)) return;

        try {
            const { error: dbError } = await supabase.from('rutinas').delete().eq('id_rutina', id_rutina);
            if (dbError) throw dbError;
            cargarRutinas(disciplinaSeleccionada);
        } catch (err) {
            console.error("Error al borrar:", err);
            setError("No se pudo borrar la rutina por un error del servidor.");
        }
    };

    // --- NUEVA LÓGICA DE DÍAS PERMITIDOS ---
    const isSalaMaquinas = disciplinas.find(d => d.id_disciplina === disciplinaSeleccionada)?.nombre === 'Sala de Máquinas';
    const diasPermitidos = isSalaMaquinas
        ? Object.keys(ORDEN_DIAS) // Lunes a Domingo
        : Object.keys(ORDEN_DIAS).filter(dia => dia !== 'Sábado' && dia !== 'Domingo'); // Solo Lunes a Viernes

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-800 pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3 uppercase tracking-tight">
                        <Activity className="w-8 h-8 md:w-10 md:h-10 text-fitbox-red" />
                        PLANES DE <span className="text-fitbox-red">ENTRENAMIENTO</span>
                    </h1>
                    <p className="text-fitbox-text-muted mt-2 text-sm md:text-base">
                        {isAdminOrMonitor
                            ? 'Gestiona y asigna los bloques de trabajo oficiales para los socios del club.'
                            : 'Consulta los bloques de trabajo oficiales del gimnasio clasificados por disciplina.'}
                    </p>
                </div>

                {isAdminOrMonitor && disciplinaSeleccionada && (
                    <Button
                        onClick={() => {
                            setNuevaRutina({ dia_semana: 'Lunes', titulo: '', descripcion: '' });
                            setShowModal(true);
                        }}
                        className="bg-fitbox-red hover:bg-red-700 text-white font-bold w-full md:w-auto shadow-lg shadow-fitbox-red/20 py-6"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Añadir Nueva Rutina
                    </Button>
                )}
            </div>

            {error && <Alert type="error" message={error} />}

            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-5 h-5 text-gray-500" />
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Selecciona una Disciplina</h3>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {disciplinas.map(d => (
                        <button
                            key={d.id_disciplina}
                            onClick={() => setDisciplinaSeleccionada(d.id_disciplina)}
                            className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-300 border ${disciplinaSeleccionada === d.id_disciplina
                                ? 'bg-fitbox-red border-fitbox-red text-white shadow-lg shadow-fitbox-red/20'
                                : 'bg-neutral-900 border-neutral-800 text-gray-500 hover:bg-neutral-800 hover:text-white'
                                }`}
                        >
                            {d.nombre}
                        </button>
                    ))}
                </div>
            </div>

            {rutinas.length === 0 ? (
                <div className="py-20 text-center text-gray-500 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20 flex flex-col items-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-neutral-800" />
                    <h3 className="text-xl font-bold text-white mb-2">Sin entrenamientos planificados</h3>
                    <p className="text-sm max-w-md text-center">
                        {isAdminOrMonitor
                            ? 'Aún no has diseñado ninguna rutina para esta disciplina. Haz clic en "Añadir Nueva Rutina" para empezar.'
                            : 'Los monitores aún no han subido los bloques de entrenamiento para esta disciplina.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {rutinas.map(rutina => (
                        <Card key={rutina.id_rutina} className="bg-neutral-950/80 p-0 border-neutral-800 hover:border-neutral-600 transition-all relative group overflow-hidden flex flex-col h-full shadow-xl">

                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-fitbox-red/10 rounded-full blur-3xl group-hover:bg-fitbox-red/20 transition-colors pointer-events-none"></div>

                            <div className="p-6 pb-4 flex justify-between items-start border-b border-neutral-800/50 bg-black/20">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-950/30 border border-fitbox-red/30 rounded-lg">
                                    <Calendar className="w-3.5 h-3.5 text-fitbox-red" />
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest">{rutina.dia_semana}</span>
                                </div>

                                {isAdminOrMonitor && (
                                    <button
                                        onClick={() => handleBorrarRutina(rutina.id_rutina, rutina.titulo)}
                                        className="text-neutral-500 hover:text-red-500 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                                        title="Eliminar Rutina"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="p-6 grow flex flex-col">
                                <h3 className="text-xl font-black text-white mb-3 leading-tight uppercase">
                                    {rutina.titulo}
                                </h3>

                                <div className="w-8 h-1 bg-fitbox-red mb-4 rounded-full"></div>

                                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap grow">
                                    {rutina.descripcion}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {showModal && isAdminOrMonitor && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <Card className="max-w-lg w-full bg-neutral-950 border-neutral-800 p-6 sm:p-8 relative shadow-2xl overflow-hidden">

                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-fitbox-red via-red-600 to-red-900"></div>

                        <button
                            onClick={() => !isSaving && setShowModal(false)}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                Diseñar <span className="text-fitbox-red">Rutina</span>
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">Añade un nuevo bloque de trabajo para la disciplina actual.</p>
                        </div>

                        <div className="space-y-6">
                            {modalError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 shrink-0" /> {modalError}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Día de la semana</label>
                                <select
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white font-bold rounded-lg px-4 py-3 text-sm focus:border-fitbox-red outline-none transition-colors"
                                    value={nuevaRutina.dia_semana}
                                    onChange={(e) => setNuevaRutina({ ...nuevaRutina, dia_semana: e.target.value })}
                                >
                                    {/* Mapeamos SOLO los días permitidos según la regla */}
                                    {diasPermitidos.map(dia => (
                                        <option key={dia} value={dia}>{dia}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Título del Bloque / Enfoque</label>
                                <Input
                                    placeholder="Ej: Tren superior, Core y Movilidad..."
                                    className="bg-neutral-900 border-neutral-800 text-white font-medium"
                                    value={nuevaRutina.titulo}
                                    onChange={(e) => setNuevaRutina({ ...nuevaRutina, titulo: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Descripción / Ejercicios</label>
                                <textarea
                                    placeholder="Detalla las series, repeticiones y ejercicios aquí... (Puedes usar saltos de línea)"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 text-sm focus:border-fitbox-red outline-none min-h-40 resize-y font-medium transition-colors placeholder:text-neutral-600"
                                    value={nuevaRutina.descripcion}
                                    onChange={(e) => setNuevaRutina({ ...nuevaRutina, descripcion: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4 mt-2">
                                <Button variant="ghost" className="flex-1 hover:bg-neutral-900 hover:text-white text-gray-400 font-bold" onClick={() => setShowModal(false)} disabled={isSaving}>
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleCrearRutina}
                                    disabled={isSaving}
                                    className="flex-1 bg-fitbox-red hover:bg-red-700 font-bold shadow-lg shadow-fitbox-red/20 text-white"
                                >
                                    <Save className="w-5 h-5 mr-2" />
                                    {isSaving ? 'Guardando...' : 'Publicar Rutina'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};