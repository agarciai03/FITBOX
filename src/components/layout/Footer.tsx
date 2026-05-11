import { MapPin, X } from 'lucide-react';
import { useState } from 'react';

export const Footer = () => {
    // Estado para controlar qué modal legal está abierto
    const [modalOpen, setModalOpen] = useState<'privacidad' | 'terminos' | 'cookies' | null>(null);

    // Contenido dinámico de los textos legales
    const modales = {
        privacidad: {
            titulo: "Política de Privacidad",
            contenido: (
                <div className="space-y-4 text-sm text-gray-300">
                    <p>En <strong className="text-white">FITBOX</strong>, respetamos tu privacidad y protegemos tus datos personales conforme al Reglamento General de Protección de Datos (RGPD).</p>
                    <h4 className="text-white font-bold text-base mt-6">1. Uso de los Datos</h4>
                    <p>Los datos recabados en el registro (DNI, nombre, apellidos, email, teléfono y fecha de nacimiento) se utilizan exclusivamente para la gestión de tu membresía, tramitación de cobros, reservas de clases y control de aforo.</p>
                    <h4 className="text-white font-bold text-base mt-6">2. Almacenamiento Seguro</h4>
                    <p>Tus datos están protegidos mediante cifrado avanzado y almacenados en servidores seguros. No compartimos, vendemos ni alquilamos tu información personal a terceros bajo ninguna circunstancia.</p>
                    <h4 className="text-white font-bold text-base mt-6">3. Derechos del Usuario</h4>
                    <p>Tienes derecho a solicitar el acceso, rectificación, portabilidad o eliminación de tus datos en cualquier momento desde tu perfil de usuario o contactando con la administración del club.</p>
                </div>
            )
        },
        terminos: {
            titulo: "Términos y Condiciones",
            contenido: (
                <div className="space-y-4 text-sm text-gray-300">
                    <p>Al inscribirte y utilizar la plataforma de <strong className="text-white">FITBOX</strong>, aceptas las siguientes normas de convivencia y uso de las instalaciones:</p>
                    <h4 className="text-white font-bold text-base mt-6">1. Membresía y Pagos</h4>
                    <p>La cuota debe ser abonada puntualmente. El impago resultará en la suspensión automática del acceso a la plataforma de reservas y a la entrada del recinto físico mediante los tornos de seguridad.</p>
                    <h4 className="text-white font-bold text-base mt-6">2. Uso de Instalaciones y Equipamiento</h4>
                    <p>Es estricto y obligatorio el uso de toalla personal y calzado deportivo limpio y adecuado. El material (mancuernas, discos, sacos) debe ser recogido, limpiado y devuelto a su sitio tras cada uso.</p>
                    <h4 className="text-white font-bold text-base mt-6">3. Sistema de Reservas y Cancelaciones</h4>
                    <p>Las reservas de clases dirigidas están sujetas a un aforo máximo estricto para garantizar la calidad del entrenamiento. Si no puedes asistir, es obligatorio cancelar la reserva a través de la app para ceder tu plaza a otro compañero.</p>
                </div>
            )
        },
        cookies: {
            titulo: "Política de Cookies",
            contenido: (
                <div className="space-y-4 text-sm text-gray-300">
                    <p>La plataforma web de <strong className="text-white">FITBOX</strong> utiliza cookies para garantizar el correcto funcionamiento técnico y mejorar tu experiencia de usuario.</p>
                    <h4 className="text-white font-bold text-base mt-6">Cookies Técnicas (Estrictamente necesarias)</h4>
                    <p>Utilizamos cookies esenciales de sesión para mantenerte conectado de forma segura (gestión de tokens de autenticación), recordar tu idioma preferido (ES/EN) y respetar tu elección de diseño visual (Modo Claro/Oscuro).</p>
                    <h4 className="text-white font-bold text-base mt-6">Cookies de Rastreo y Terceros</h4>
                    <p>Actualmente FITBOX <strong>NO utiliza</strong> cookies de rastreo publicitario ni vende patrones de navegación a terceros. Tu navegación por el panel de socio es completamente privada y segura.</p>
                </div>
            )
        }
    };

    return (
        <>
            <footer className="bg-neutral-950/60 backdrop-blur-xl border-t border-neutral-800/50 pt-8 pb-6 mt-auto relative z-40">
                <div className="max-w-7xl mx-auto px-4 md:px-8">

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <div className="flex flex-col items-center md:items-start gap-1">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                                FIT<span className="text-fitbox-red">BOX</span>
                            </h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-fitbox-red" /> Atletas sin límites
                            </p>
                        </div>

                        {/* ENLACES A REDES SOCIALES */}
                        <div className="flex gap-4">
                            <a
                                href="https://www.instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Instagram"
                                className="w-10 h-10 rounded-full bg-neutral-900/50 border border-neutral-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-fitbox-red hover:bg-fitbox-red/10 transition-all duration-300 group shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                            </a>
                            <a
                                href="https://www.x.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Twitter / X"
                                className="w-10 h-10 rounded-full bg-neutral-900/50 border border-neutral-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-fitbox-red hover:bg-fitbox-red/10 transition-all duration-300 group shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                            </a>
                            <a
                                href="https://www.youtube.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="YouTube"
                                className="w-10 h-10 rounded-full bg-neutral-900/50 border border-neutral-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-fitbox-red hover:bg-fitbox-red/10 transition-all duration-300 group shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M2.5 7.1C2.5 7.1 2 9.5 2 12c0 2.5.5 4.9.5 4.9.3 1.2 1.3 2.1 2.5 2.4C7.5 19.8 12 19.8 12 19.8s4.5 0 7-.5c1.2-.3 2.2-1.2 2.5-2.4.5-2.4.5-4.9.5-4.9s-.5-2.4-.5-4.9C21.2 6 20.2 5 19 4.7 16.5 4.2 12 4.2 12 4.2s-4.5 0-7 .5C3.8 5 2.8 6 2.5 7.1z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>
                            </a>
                        </div>
                    </div>

                    <div className="w-full h-px bg-linear-to-r from-transparent via-neutral-800 to-transparent mb-6"></div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-gray-500 font-medium">
                            &copy; {new Date().getFullYear()} FITBOX. Todos los derechos reservados.
                        </p>

                        {/* BOTONES DE APARTADOS LEGALES */}
                        <div className="text-gray-500 font-bold flex flex-wrap justify-center gap-4 md:gap-6 uppercase tracking-widest text-[10px]">
                            <button onClick={() => setModalOpen('privacidad')} className="hover:text-fitbox-red transition-colors focus:outline-none">Política de Privacidad</button>
                            <button onClick={() => setModalOpen('terminos')} className="hover:text-fitbox-red transition-colors focus:outline-none">Términos y Condiciones</button>
                            <button onClick={() => setModalOpen('cookies')} className="hover:text-fitbox-red transition-colors focus:outline-none">Política de Cookies</button>
                        </div>
                    </div>

                </div>
            </footer>

            {/* MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-fitbox-card border border-neutral-800 rounded-2xl w-full max-w-2xl relative shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Línea superior roja */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-fitbox-red to-red-900"></div>

                        {/* Cabecera del modal */}
                        <div className="flex justify-between items-start p-6 md:p-8 border-b border-neutral-800 bg-neutral-900/30">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                    {modales[modalOpen].titulo.split(' ')[0]} <span className="text-fitbox-red">{modales[modalOpen].titulo.split(' ').slice(1).join(' ')}</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Información Legal FITBOX</p>
                            </div>
                            <button onClick={() => setModalOpen(null)} className="text-gray-500 hover:text-white transition-colors bg-neutral-900/50 hover:bg-neutral-800 p-2 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            {modales[modalOpen].contenido}
                        </div>

                        {/* Pie del modal con botón de aceptar */}
                        <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 text-right">
                            <button
                                onClick={() => setModalOpen(null)}
                                className="bg-fitbox-red hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-fitbox-red/20 w-full sm:w-auto"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};