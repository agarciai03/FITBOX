# 💪 FITBOX — Sistema Integral de Gestión Deportiva

![Frontend](https://img.shields.io/badge/Frontend-React-blue?logo=react&logoColor=white) ![Backend](https://img.shields.io/badge/Backend-Supabase-green?logo=supabase&logoColor=white) ![Estilos](https://img.shields.io/badge/Estilos-TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white) ![Licencia](https://img.shields.io/badge/Licencia-MIT-yellow)

> 🧠 **FITBOX** es una aplicación web final del ciclo Desarrollo de Aplicaciones Web. Permite a cada centro deportivo gestionar su inventario, reservas, caja y los progresos de los socios mediante gamificación.

FITBOX combina una arquitectura moderna y modular:
🔹 **Gestión de usuarios:** login, roles (admin, monitor, socio), suscripción y perfil.
🔹 **Diseño:** limpio, oscuro, responsive y con componentes reutilizables.
🔹 **Objetivo:** centralizar la gestión de un gimnasio y fidelizar mediante gamificación.

## 🚀 Despliegue

Accede a la versión en producción: [https://fitbox-gym.vercel.app/](https://fitbox-gym.vercel.app/)

## 🧱 Estructura del proyecto

    fitbox/
    │
    ├── public/               # Recursos estáticos (imágenes, logos…)
    │
    ├── docs/                 # Documentación (manual de usuario y manual técnico)
    │
    ├── src/
    │   ├── components/       # Layout, Modal, etc.
    │   ├── pages/            # Landing, Login, Dashboard, Clases, Pagos, Inventario
    │   ├── database/         # Cliente Supabase y repositorios
    │   ├── store/            # Contexto y Estado de Autenticación (Zustand)
    │   ├── App.tsx           # Enrutamiento principal
    │   ├── main.tsx          # Entrada React
    │   └── index.css         # Estilos globales Tailwind
    │
    ├── .env                  # Variables locales (NO se sube)
    ├── package.json
    ├── tailwind.config.js
    ├── README.md
    └── .gitignore

## ⚙️ Instalación y ejecución local

1️⃣ Clonar el repositorio

    git clone https://github.com/agarciai03/FITBOX.git
    cd FITBOX

2️⃣ Instalar dependencias

    npm install

3️⃣ Ejecutar el entorno de desarrollo

    npm run dev

El proyecto se abrirá en: http://localhost:5173

## 🗄️ Base de datos (Supabase)

Tablas principales de la base de datos relacional:

| Tabla | Descripción y campos principales |
| :--- | :--- |
| **usuarios** | Perfil completo del usuario (`email`, `id_rol`, `estado_pago`, `xp`, `nivel`). |
| **clases** | Cuadrante de horarios (`fecha`, `hora_inicio`, `hora_fin`, `aforo_maximo`, monitor). |
| **reservas** | Registro de plazas y asistencias (tabla puente con `id_clase`, `id_socio`, `estado`, `asistencia`). |
| **maquinas** | Inventario técnico y averías (`estado`, `fecha_averia`, `observaciones`, `tutorial_url`). |
| **pagos** | Historial financiero y suscripciones (`importe`, `concepto`, `estado_pago`, `metodo_pago`). |
| **rutinas** | Planes de entrenamiento organizados por `id_disciplina`, `dia_semana`, `titulo`, `descripcion`. |
| **disciplinas** | Catálogo de actividades disponibles en el centro y aforos máximos predeterminados. |
| **roles** | Definición de los niveles de acceso al aplicativo (Admin, Monitor, Socio). |

Políticas RLS (Row Level Security):
* **Socios:** Solo pueden leer y modificar sus propios datos personales, ver sus pagos y gestionar sus reservas.
* **Monitores:** Pueden gestionar la asistencia de las reservas en las clases asignadas y actualizar maquinaria.
* **Administradores:** Acceso global y total para auditar pagos, gestionar usuarios e inventario.

## 👤 Roles de usuario

| Rol | Permisos |
| :--- | :--- |
| **Socio** | Ver dashboard, reservar clases, consultar XP y pagar membresía |
| **Monitor** | Ver clases asignadas, pasar lista y reportar averías de máquinas |
| **Admin** | Gestionar pagos, métricas financieras, inventario y alta de empleados |

## 🧠 Tecnologías principales

| Tecnología | Uso |
| :--- | :--- |
| ⚛️ React + Vite | Frontend moderno y rápido |
| 🎨 TailwindCSS | Estilos consistentes, adaptables y modo oscuro |
| 🧰 Supabase | Backend con PostgreSQL, Auth y Storage |
| 🧾 Markdown | Documentación del proyecto |

## 💻 Comandos útiles

| Acción | Comando |
| :--- | :--- |
| Instalar dependencias | `npm install` |
| Ejecutar en desarrollo | `npm run dev` |
| Build de producción | `npm run build` |
| Previsualizar build | `npm run preview` |

## 🧩 Características implementadas

✅ Vistas: inicio, login, dashboard, clases, pagos, inventario, 404
✅ Navegación con React Router
✅ Componentes reutilizables (Navbar, Modal, Route Guards)
✅ Estilo responsive con modo oscuro
✅ Supabase con RLS y roles
✅ Sistema de autenticación y rol de administrador
✅ Gamificación automática de experiencia y niveles

| Vista | Descripción |
| :--- | :--- |
| 🏠 Inicio | Presentación y CTA principal |
| 🔐 Login / Registro | Acceso y autenticación de usuario |
| 📊 Dashboard | Seguimiento de membresía y progreso |
| 💳 Pagos | Pasarela financiera para abonar cuotas |
| 🏋️ Clases | Motor de reservas y aforos |
| ⚙️ Administración | Gestión técnica, staff y gráficas anuales |

## 🧑‍🏫 Tutorías

Tutor: Francisco José Mera Calderón

Resumen de las tutorías:
Se mantuvo una reunión semanal, siguiendo un plan estructurado para el desarrollo del TFG.
* **Semana 1** — Inicio y planificación: definición de alcance, objetivos y criterios de evaluación.
* **Semana 2** — Elección de stack y estructura básica del proyecto (React + Vite, Tailwind, Supabase).
* **Semana 3** — Modelado de datos en Supabase: tablas, roles y políticas RLS.
* **Semana 4** — Implementación de vistas principales: Landing, Dashboard, Clases.
* **Semana 5** — Diseño y componentes UI: Navbar, Footer, cards y botones reutilizables; responsive y modo oscuro.
* **Semana 6** — Autenticación y gestión de sesiones con Supabase Auth.
* **Semana 7** — Integración de lógica de reservas, gamificación y roles.
* **Semana 8** — Pruebas, pasarela de pagos, corrección de bugs y ajustes en políticas RLS.
* **Semana 9** — Documentación final: consolidación del manual técnico y de usuario; preparación para entrega y defensa.

Notas del seguimiento:
Cada sesión siguió la estructura: resumen de avances, demo funcional, bloqueo/riesgos y tareas para la siguiente semana.

## 👩‍💻 Autoría

Alberto García Izquierdo  
CFGS en Desarrollo de Aplicaciones Web (DAW)  
📍 IES Albarregas – Mérida (España)  
📘 Proyecto TFG: FITBOX – Sistema Integral de Gestión Deportiva (2026)

## 🏷️ Licencia

Distribuido bajo licencia MIT.
