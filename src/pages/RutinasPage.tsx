import { useState, useEffect } from 'react';
import { ClassRepository, type Disciplina, type Rutina } from '../database/repositories/ClassRepository';
import { Dumbbell, Activity } from 'lucide-react';

export const RutinasPage = () => {
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [rutinas, setRutinas] = useState<Rutina[]>([]);
    const [disciplinaSeleccionada, setDisciplinaSeleccionada] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Cargar disciplinas al entrar
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

    // Cargar rutinas cuando cambia la disciplina
    useEffect(() => {
        if (disciplinaSeleccionada) {
            ClassRepository.getRutinasByDisciplina(disciplinaSeleccionada)
                .then(data => setRutinas(data))
                .catch(errorCatch => {
                    console.error("Fallo en rutinas:", errorCatch);
                    setError("No se pudieron cargar las rutinas de esta disciplina.");
                });
        }
    }, [disciplinaSeleccionada]);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Cabecera */}
            <div>
                <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 uppercase tracking-tight">
                    <Activity className="w-8 h-8 text-fitbox-red" />
                    RUTINAS DE <span className="text-fitbox-red">ENTRENAMIENTO</span>
                </h1>
                <p className="text-fitbox-text-muted mt-1">Consulta los planes de trabajo oficiales del gimnasio clasificados por disciplina.</p>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg font-medium">{error}</div>}

            <div className="space-y-6">
                {/* Selector de Disciplina */}
                <div className="flex items-center gap-4 bg-fitbox-card p-4 rounded-xl border border-neutral-800">
                    <Dumbbell className="w-6 h-6 text-fitbox-red" />
                    <label className="font-bold text-white uppercase text-sm">Elegir Disciplina:</label>
                    <select
                        className="bg-neutral-900 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:border-fitbox-red outline-none"
                        value={disciplinaSeleccionada}
                        onChange={(e) => setDisciplinaSeleccionada(e.target.value)}
                    >
                        {disciplinas.map(d => <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre}</option>)}
                    </select>
                </div>

                {/* Grid de Rutinas */}
                {rutinas.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 border border-dashed border-neutral-800 rounded-xl">
                        No hay rutinas oficiales subidas para esta disciplina todavía.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rutinas.map(rutina => (
                            <div key={rutina.id_rutina} className="bg-fitbox-card p-6 rounded-xl border border-neutral-800 hover:border-fitbox-red/50 transition-all cursor-pointer group">
                                <h3 className="font-black text-fitbox-red uppercase tracking-tighter mb-1">{rutina.dia_semana}</h3>
                                <p className="font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{rutina.titulo}</p>
                                <p className="text-sm text-fitbox-text-muted leading-relaxed">{rutina.descripcion}</p>
                                {/* Aquí insertaremos fotos/videos en el futuro */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};