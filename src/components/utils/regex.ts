export const REGEX = {
    TEXTO_PURO: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/, // Solo letras y espacios, mínimo 2
    TELEFONO: /^[6789]\d{8}$/, // Teléfonos de España (empiezan por 6,7,8,9 y tienen 9 cifras)
    EMAIL_GENERAL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(es|com|org|net|eu|info|cat|gal)$/i,
    EMAIL_GMAIL: /^[a-zA-Z0-9._-]+@gmail\.com$/,
    PASSWORD: /^.{6,}$/,
    CODIGO_POSTAL: /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/,
    DNI: /^\d{8}[A-Z]$/,
    NIE: /^[XYZ]\d{7}[A-Z]$/
};

export const calcularLetraDNI = (dniNumeros: string): string => {
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    let numero = dniNumeros;
    if (numero.startsWith('X')) numero = '0' + numero.substring(1);
    else if (numero.startsWith('Y')) numero = '1' + numero.substring(1);
    else if (numero.startsWith('Z')) numero = '2' + numero.substring(1);

    const index = parseInt(numero, 10) % 23;
    return letras.charAt(index);
};

export const isValidDNI = (dni: string): boolean => {
    const dniLimpio = dni.toUpperCase().trim();
    if (!REGEX.DNI.test(dniLimpio) && !REGEX.NIE.test(dniLimpio)) return false;

    const numeroStr = dniLimpio.substring(0, 8);
    const letra = dniLimpio.charAt(8);

    return calcularLetraDNI(numeroStr) === letra;
};

// Borra al instante cualquier número o símbolo de un texto
export const limpiarTexto = (texto: string): string => {
    return texto.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
};

// Borra al instante cualquier letra de un número
export const limpiarNumeros = (texto: string): string => {
    return texto.replace(/\D/g, '');
};

// Limpiador estricto para DNI/NIE en tiempo real (UX Fluida)
export const limpiarDNI = (texto: string): string => {
    let valor = texto.toUpperCase().replace(/[^0-9A-Z]/g, '');

    // Filtro inteligente: Obliga a que empiece por X,Y,Z o número, seguido de hasta 7 números, y opcional 1 letra al final.
    const match = valor.match(/^[XYZ0-9][0-9]{0,7}[A-Z]?/);
    valor = match ? match[0] : '';

    // Autocalculamos la letra si tenemos el formato numérico completo
    if (/^\d{8}$/.test(valor) || /^[XYZ]\d{7}$/.test(valor)) {
        valor += calcularLetraDNI(valor);
    }

    return valor.slice(0, 9);
};