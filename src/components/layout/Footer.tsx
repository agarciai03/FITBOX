export const Footer = () => {
    return (
        <footer className="bg-fitbox-bg border-t border-neutral-800 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-fitbox-text-muted">
                    &copy; {new Date().getFullYear()} FITBOX. Todos los derechos reservados.
                </p>
                <div className="text-sm text-fitbox-text-muted flex gap-4">
                    <span className="hover:text-fitbox-red cursor-pointer transition-colors">Términos</span>
                    <span className="hover:text-fitbox-red cursor-pointer transition-colors">Privacidad</span>
                </div>
            </div>
        </footer>
    );
};