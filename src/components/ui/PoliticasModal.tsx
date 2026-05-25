import { X } from 'lucide-react';
import { Button } from './Button';

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PolicyModal = ({ isOpen, onClose }: PolicyModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-9999 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300">
                {/* Encabezado */}
                <div className="sticky top-0 bg-neutral-950 border-b border-neutral-800 p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Política de Privacidad y Términos de Servicio</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-fitbox-red transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-6 text-gray-300 text-sm leading-relaxed">
                    
                    <section>
                        <h3 className="text-lg font-bold text-white mb-3">1. Introducción</h3>
                        <p>
                            Bienvenido a FITBOX. Estos Términos de Servicio y nuestra Política de Privacidad rigen el uso de nuestra plataforma, servicios y aplicaciones. Al registrarse y usar FITBOX, aceptas estos términos en su totalidad.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-3">2. Recopilación de Datos</h3>
                        <p>
                            Recopilamos información personal que voluntariamente proporcionas, incluyendo:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
                            <li>Nombre, apellidos, y correo electrónico</li>
                            <li>Número de teléfono y dirección</li>
                            <li>Información de pago para procesar suscripciones</li>
                            <li>Datos de actividad y preferencias de clases</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-3">3. Uso de Datos</h3>
                        <p>
                            Utilizamos tus datos personales para:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
                            <li>Gestionar tu cuenta y suscripción</li>
                            <li>Procesar pagos de forma segura</li>
                            <li>Enviar notificaciones sobre tus reservas y clases</li>
                            <li>Mejorar nuestros servicios y experiencia de usuario</li>
                            <li>Cumplir con obligaciones legales</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-3">4. Seguridad de Datos</h3>
                        <p>
                            FITBOX implementa medidas de seguridad técnicas y organizativas para proteger tus datos personales contra acceso no autorizado, alteración y divulgación. Los datos se almacenan en servidores encriptados.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-3">5. Derechos del Usuario</h3>
                        <p>
                            Tienes derecho a:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
                            <li>Acceder a tus datos personales</li>
                            <li>Solicitar la corrección de datos inexactos</li>
                            <li>Solicitar la eliminación de datos (derecho al olvido)</li>
                            <li>Portabilidad de datos</li>
                            <li>Oposición al procesamiento de datos</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-3">6. Cancelación de Suscripción</h3>
                        <p>
                            Puedes cancelar tu suscripción en cualquier momento desde tu perfil. Una vez cancelada, perderás acceso a todas las funcionalidades premium hasta que renueves tu suscripción. Los datos de tu cuenta se conservarán durante 30 días tras la cancelación.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-3">7. Cambios en los Términos</h3>
                        <p>
                            FITBOX se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios entrarán en vigor inmediatamente tras su publicación. El uso continuado de la plataforma constituye aceptación de los cambios.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-3">8. Contacto</h3>
                        <p>
                            Si tienes preguntas sobre esta política, contacta con nuestro equipo de soporte en:
                        </p>
                        <p className="mt-2 text-fitbox-red font-bold">
                            privacidad@fitbox.com
                        </p>
                    </section>

                    <section className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-lg">
                        <p className="text-xs text-gray-500">
                            <span className="font-bold">Última actualización:</span> 2026-05-25
                        </p>
                    </section>

                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-neutral-950 border-t border-neutral-800 p-6 flex justify-end gap-3">
                    <Button 
                        onClick={onClose}
                        className="bg-fitbox-red hover:bg-red-700 text-white font-bold"
                    >
                        Entendido
                    </Button>
                </div>
            </div>
        </div>
    );
};
