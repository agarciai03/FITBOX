# 💪 FITBOX — Sistema Integral de Gestión Deportiva

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

🧠 **FITBOX** es una aplicación web desarrollada como proyecto final del CFGS en Desarrollo de Aplicaciones Web (DAW). Permite gestionar usuarios, clases, inventario y finanzas utilizando una arquitectura moderna basada en React, TypeScript, Vite, TailwindCSS y Supabase.

🔗 **Versión en producción:** [https://fitbox-gym.vercel.app/](https://fitbox-gym.vercel.app/)
<img width="1904" height="909" alt="image" src="https://github.com/user-attachments/assets/13343e76-3b31-4926-b030-0afa8e2c4480" />

---

## 📑 Índice

- 🌍 [Descripción general](#-descripción-general)
- 🗄️ [Base de datos (Supabase)](#️-base-de-datos-supabase)
- 🧱 [Estructura del proyecto](#-estructura-del-proyecto)
- ⚙️ [Instalación y ejecución local](#️-instalación-y-ejecución-local)
- 🚀 [Despliegue en Vercel](#-despliegue-en-vercel)
- 👤 [Roles de usuario](#-roles-de-usuario)
- 🧠 [Tecnologías principales](#-tecnologías-principales)
- 💻 [Comandos útiles](#-comandos-útiles)
- 🧩 [Funcionalidades implementadas](#-funcionalidades-implementadas)
- 📚 [Documentación](#-documentación)
- 👨‍💻 [Autoría](#-autoría)

---

## 🌍 Descripción general

FITBOX centraliza la gestión operativa de un centro deportivo, permitiendo coordinar las actividades del centro desde el navegador.

- **Gestión jerárquica de roles:** Administrador, monitor y socio.
- **Control de clases:** Gestión de horarios, aforos y reservas.
- **Inventario técnico:** Control de estado de maquinaria y averías.
- **Gamificación:** Sistema de XP y niveles para socios.
- **Gestión financiera:** Control de pagos y suscripciones de los socios.
- **Internacionalización (i18n):** Soporte para español e inglés.
- **Diseño responsive:** Interfaz adaptable con modo oscuro.

---

## 🗄️ Base de datos (Supabase)

![Diagrama de la Base de Datos](docs/diagrama_bd.png)

El sistema FITBOX se apoya en una base de datos relacional PostgreSQL (gestionada a través de Supabase). El modelo de datos está altamente normalizado para evitar redundancias, garantizar la integridad referencial y facilitar la escalabilidad del proyecto.

### Arquitectura de Datos
- **Gestión de Identidad y Accesos:** Separación entre `roles` (maestra de privilegios) y `usuarios` (perfil extendido con métricas de gamificación y estado de membresía).
- **Módulo Deportivo:** Las tablas `disciplinas` y `clases` organizan las actividades y horarios.
- **Motor de Reservas:** La tabla `reservas` actúa como pivote (N:M) entre usuarios y clases, incorporando el control de asistencia.
- **Inventario y Financiero:** Trazabilidad completa de `maquinas` (y sus averías) y de `pagos` asociados a los socios.

## 🧱 Estructura del proyecto

```text
fitbox/
    ├── docs/
    ├── public/
    └── src/
        ├── assets/
        ├── components/
        ├── database/
        ├── interfaces/
        ├── lib/
        ├── locales/
        ├── pages/
        ├── store/
        ├── styles/
        ├── utils/
        ├── App.tsx
        ├── i18n.ts
        └── main.tsx
    ├── .env
    ├── .gitattributes
    ├── .gitignore
    ├── README.md
    ├── components.json
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vercel.json
    └── vite.config.ts
```

---

## ⚙️ Instalación y ejecución local

### 1️⃣ Requisitos previos

- **Node.js:** 18.x 
- **npm:** 9.x
- **Git**

### 2️⃣ Clonar el repositorio

```bash
git clone [https://github.com/agarciai03/FITBOX.git](https://github.com/agarciai03/FITBOX.git)
cd FITBOX
```

### 3️⃣ Instalar dependencias

```bash
npm install
```

### 4️⃣ Ejecutar en desarrollo

```bash
npm run dev
```

---

## 🚀 Despliegue en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fagarciai03%2FFITBOX)

El proyecto incluye la configuración necesaria (`vercel.json`) para desplegarse sin problemas. Durante la importación en Vercel, el entorno de **Vite** se autoconfigurará. 

Solo necesitas proveer las siguientes variables de entorno para conectar el backend:

| Variable | Descripción |
| :--- | :--- |
| `VITE_SUPABASE_URL` | URL de tu proyecto en Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase. |

---

## 👤 Roles de usuario

| Rol | Permisos principales |
| :--- | :--- |
| **ADMIN** | Gestión total (usuarios, finanzas, inventario, alta de personal). |
| **MONITOR** | Gestión de clases, pasar lista, reporte de averías, rutinas. |
| **SOCIO** | Reservar clases, ver progresos (XP/Nivel), gestionar pagos, perfil. |

---

## 🧠 Tecnologías principales

| Tecnología | Uso |
| :--- | :--- |
| **React** | Librería de interfaz de usuario (SPA). |
| **TypeScript** | Tipado estático. |
| **Vite** | Build tool rápido. |
| **TailwindCSS** | Framework CSS (responsive). |
| **Supabase** | BaaS: PostgreSQL + Auth + API REST + RLS. |
| **Zustand** | Gestión de estado global. |
| **i18next** | Internacionalización (ES/EN). |

---

## 💻 Comandos útiles

| Acción | Comando |
| :--- | :--- |
| Instalar dependencias | `npm install` |
| Ejecutar en desarrollo | `npm run dev` |
| Construir para producción | `npm run build` |

---

## 🧩 Funcionalidades implementadas

**🔐 Autenticación y Seguridad**
- Registro e inicio de sesión con Supabase Auth.
- Gestión segura de cambio de contraseñas desde el perfil.
- Bloqueo automático de acceso y vistas protegidas para usuarios con pagos pendientes (morosos).

**👑 Panel de Administración**
- **Panel de control (Dashboard):** Visión global de ingresos, afluencia y estado del centro.
- **Gestión de Usuarios:** Altas, bajas y edición de perfiles de socios y empleados.
- **Control de Caja y Pagos:** Seguimiento de ingresos y control exhaustivo de morosos.
- **Gestión de Horarios:** Creación y organización de clases y disciplinas.

**🏋️ Panel del Monitor**
- Visualización del cuadrante personal ("Mis Clases").
- Control de asistencia interactivo ("Pasar lista").
- Reporte rápido de averías e incidencias en el equipamiento.

**🏃‍♂️ Portal del Socio**
- **Motor de Reservas:** Inscripción a clases con control de aforo máximo en tiempo real.
- **Planes de Entrenamiento:** Acceso al catálogo de rutinas y ejercicios por disciplina.
- **Gestión Financiera:** Historial detallado de pagos, pasarela de pago simulada y opción de baja de suscripción.

**🎮 Gamificación y Perfil**
- Sistema de progresión con barra interactiva de XP y niveles basada en la actividad.
- Subida y almacenamiento de imágenes de perfil (Avatar) mediante Supabase Storage.
- Edición completa de información personal y ubicación.

**💻 Interfaz y Experiencia de Usuario (UX/UI)**
- **Dashboard Dinámico:** La vista principal cambia su contenido y accesos directos dependiendo del rol del usuario.
- **Navegación inteligente:** Menú lateral (Sidebar) colapsable en escritorio y tipo *off-canvas* en móviles.
- **Gráficos interactivos:** Visualización de la ocupación del centro y recomendaciones de asistencia.
- Internacionalización completa (i18n) soportando idiomas Español e Inglés.
- Diseño *Fully Responsive* con tema oscuro nativo y notificaciones integradas (Alerts).

---

## 📚 Documentación

Toda la documentación académica y diagramas generados para este proyecto se encuentran organizados en la carpeta `docs/`:

**Manuales y Propuestas:**
- [Instrucciones de uso FITBOX](docs/Instrucciones_de_uso_FITBOX.pdf)
- [Manual de Usuario FITBOX](docs/manual_de_usuario_FITBOX.pdf)
- [Manual Técnico FITBOX](docs/Manual_tecnico_FITBOX.pdf)
- [Propuesta del proyecto](docs/Propuesta_proyecto_FITBOX.pdf)
- [Requisitos Funcionales y Estimación de Tiempos](docs/Requisitos%20Funcionales%20y%20Estimacion%20de%20Tiempos.pdf)
- [Presentación FITBOX](docs/presentacion_fitbox.pdf)

**Diagramas del Sistema:**
- [Diagrama de Casos de Uso](docs/casos_de_uso.png)
- [Diagrama de Base de Datos](docs/diagrama_bd.png)
- [Diagrama de Flujo](docs/diagrama_de_flujo.png)
- [Esquema Supabase](docs/supabase-bd.png)

---

## 👨‍💻 Autoría

- **Proyecto:** FITBOX
- **Alumno:** Alberto García Izquierdo
- **Ciclo:** CFGS Desarrollo de Aplicaciones Web (DAW)
- **Centro:** IES Albarregas – Mérida (España)
- **Curso:** 2025/2026
