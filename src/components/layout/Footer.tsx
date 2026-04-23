import { MapPin } from 'lucide-react';

export const Footer = () => {
    return (
        // EFECTO CRISTAL: bg-neutral-950/60 y backdrop-blur-xl
        <footer className="bg-neutral-950/60 backdrop-blur-xl border-t border-neutral-800/50 pt-8 pb-6 mt-auto">
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

                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-neutral-900/50 border border-neutral-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-fitbox-red hover:bg-fitbox-red/10 transition-all duration-300 group shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-neutral-900/50 border border-neutral-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-fitbox-red hover:bg-fitbox-red/10 transition-all duration-300 group shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-neutral-900/50 border border-neutral-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-fitbox-red hover:bg-fitbox-red/10 transition-all duration-300 group shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M2.5 7.1C2.5 7.1 2 9.5 2 12c0 2.5.5 4.9.5 4.9.3 1.2 1.3 2.1 2.5 2.4C7.5 19.8 12 19.8 12 19.8s4.5 0 7-.5c1.2-.3 2.2-1.2 2.5-2.4.5-2.4.5-4.9.5-4.9s-.5-2.4-.5-4.9C21.2 6 20.2 5 19 4.7 16.5 4.2 12 4.2 12 4.2s-4.5 0-7 .5C3.8 5 2.8 6 2.5 7.1z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>
                        </a>
                    </div>
                </div>

                <div className="w-full h-px bg-linear-to-r from-transparent via-neutral-800 to-transparent mb-6"></div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500 font-medium">
                        &copy; {new Date().getFullYear()} FITBOX. Todos los derechos reservados.
                    </p>
                    <div className="text-gray-500 font-bold flex gap-6 uppercase tracking-widest text-[10px]">
                        <span className="hover:text-fitbox-red cursor-pointer transition-colors">Términos</span>
                        <span className="hover:text-fitbox-red cursor-pointer transition-colors">Privacidad</span>
                        <span className="hover:text-fitbox-red cursor-pointer transition-colors hidden sm:block">Soporte</span>
                    </div>
                </div>

            </div>
        </footer>
    );
};