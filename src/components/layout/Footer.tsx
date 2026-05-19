import { MapPin, X } from 'lucide-react';
import { useState } from 'react';

export const Footer = () => {
    const [modalOpen, setModalOpen] = useState<'privacidad' | 'terminos' | 'cookies' | null>(null);

    const modales = {
        privacidad: {
            titulo: "Política de Privacidad",
            contenido: (
                <div className="space-y-4 text-sm text-gray-300">
                    <p>En <strong className="text-white">FITBOX</strong>, respetamos tu privacidad y protegemos tus datos personales conforme al Reglamento General de Protección de Datos (RGPD).</p>
                    <h4 className="text-white font-semibold text-base mt-6">1. Uso de los Datos</h4>
                    <p>Los datos recabados en el registro (DNI, nombre, apellidos, email, teléfono y fecha de nacimiento) se utilizan exclusivamente para la gestión de tu membresía, tramitación de cobros, reservas de clases y control de aforo.</p>
                    <h4 className="text-white font-semibold text-base mt-6">2. Almacenamiento Seguro</h4>
                    <p>Tus datos están protegidos mediante cifrado avanzado y almacenados en servidores seguros. No compartimos, vendemos ni alquilamos tu información personal a terceros bajo ninguna circunstancia.</p>
                    <h4 className="text-white font-semibold text-base mt-6">3. Derechos del Usuario</h4>
                    <p>Como usuario, tienes derecho a solicitar el acceso, rectificación o eliminación definitiva de tu ficha y tus datos del sistema en cualquier momento contactando con recepción.</p>
                </div>
            )
        },
        terminos: {
            titulo: "Términos y Condiciones",
            contenido: (
                <div className="space-y-4 text-sm text-gray-300">
                    <h4 className="text-white font-semibold text-base">1. Membresía y Pagos</h4>
                    <p>La suscripción a FITBOX es de carácter mensual. El pago se realizará por adelantado el día de la inscripción y se renovará automáticamente salvo cancelación expresa por parte del socio. En caso de impago o cuota devuelta, el acceso a las instalaciones quedará suspendido (Estado: Moroso) hasta la regularización de la deuda.</p>
                    <h4 className="text-white font-semibold text-base mt-6">2. Normas de Uso</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Es obligatorio el uso de toalla personal en todas las máquinas.</li>
                        <li>El material (pesas, discos, agarres) debe ser devuelto a su lugar correspondiente tras su uso.</li>
                        <li>Cualquier avería o desperfecto detectado debe ser notificado al Staff o reportado mediante esta misma plataforma.</li>
                    </ul>
                    <h4 className="text-white font-semibold text-base mt-6">3. Reservas y Clases</h4>
                    <p>Las reservas de clases dirigidas podrán cancelarse desde la aplicación hasta 1 hora antes del inicio de la sesión. Acumular 3 ausencias sin cancelación previa conllevará una penalización temporal en el sistema de reservas.</p>
                </div>
            )
        },
        cookies: {
            titulo: "Política de Cookies",
            contenido: (
                <div className="space-y-4 text-sm text-gray-300">
                    <p>Esta plataforma web utiliza <strong className="text-white">exclusivamente cookies técnicas y de sesión</strong>, estrictamente necesarias para el correcto funcionamiento de la aplicación (mantenimiento de tu sesión de usuario activa, carrito de pagos y preferencias visuales del sistema).</p>
                    <p className="mt-4"><strong>FITBOX NO utiliza cookies publicitarias, de rastreo de terceros ni de analítica externa invasiva.</strong> Al no recopilar datos de navegación con fines comerciales, tu actividad dentro de esta intranet es totalmente privada y funcional.</p>
                </div>
            )
        }
    };

    return (
        <>
            <footer className="border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-md relative z-10 mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                        {/* Marca */}
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                                FIT<span className="text-fitbox-red">BOX</span>
                            </h2>
                            <span className="text-neutral-700">|</span>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                <MapPin className="size-3 text-fitbox-red" />
                                Centro de Alto Rendimiento
                            </p>
                        </div>

                        {/* Enlaces Legales */}
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                            <button onClick={() => setModalOpen('terminos')} className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                                Términos y Condiciones
                            </button>
                            <button onClick={() => setModalOpen('privacidad')} className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                                Política de Privacidad
                            </button>
                            <button onClick={() => setModalOpen('cookies')} className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                                Política de Cookies
                            </button>
                        </div>

                        {/* Copyright */}
                        <div className="text-right">
                            <p suppressHydrationWarning className="text-xs font-bold text-neutral-600 uppercase tracking-widest">
                                © {new Date().getFullYear()} FITBOX. Todos los derechos reservados.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* MODAL LEGAL */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
                        
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-fitbox-red to-red-900"></div>

                        {/* Cabecera del modal */}
                        <div className="flex justify-between items-start p-6 border-b border-neutral-800 bg-neutral-900/30">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
                                    {modales[modalOpen].titulo.split(' ')[0]} <span className="text-fitbox-red">{modales[modalOpen].titulo.split(' ').slice(1).join(' ')}</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Información Legal FITBOX</p>
                            </div>
                            <button onClick={() => setModalOpen(null)} className="text-gray-500 hover:text-white transition-colors bg-neutral-900/50 hover:bg-neutral-800 p-2 rounded-lg">
                                <X className="size-5" />
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