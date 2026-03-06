# 🚀 Manual de Despliegue

Instrucciones para poner en marcha el proyecto FITBOX, tanto en un entorno local de desarrollo como en producción.

## 1. Despliegue en Entorno Local (Desarrollo)

Para que un desarrollador o el tutor pueda probar la aplicación en su máquina, debe seguir estos pasos:

1. **Clonar el repositorio:**
   `git clone https://github.com/agarciai03/FITBOX.git`
2. **Instalar las dependencias:**
   Abrir la terminal en la carpeta del proyecto y ejecutar: `npm install`
3. **Variables de entorno:**
   Crear un archivo `.env` en la raíz del proyecto y añadir las credenciales de conexión a Supabase (URL y Anon Key).
4. **Arrancar el servidor:**
   Ejecutar `npm run dev`. La aplicación estará disponible en `http://localhost:5173`.

## 2. Despliegue en Producción (Vercel)

Para que la aplicación sea accesible públicamente por los socios del gimnasio, se ha automatizado el despliegue con Vercel:

1. El repositorio de GitHub está enlazado directamente a un proyecto en Vercel.
2. Las variables de entorno de producción están configuradas de forma segura en los ajustes de Vercel.
3. Cada vez que se realiza un `git push` a la rama principal (`main`), Vercel detecta los cambios, compila el proyecto de React y actualiza la web automáticamente en la URL pública asignada.
