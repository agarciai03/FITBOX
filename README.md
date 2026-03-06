# 🥊 FITBOX - Gestión Integral de Gimnasios

**Autor:** Alberto García Izquierdo  
**Tutor:** Francisco José Mera Calderón  
**Curso:** 2º DAW - IES Albarregas (2025/2026)

## 🌍 Visión general del proyecto

**FITBOX** es una aplicación web diseñada para modernizar y digitalizar la gestión de gimnasios de tamaño mediano y pequeño.

El objetivo principal es eliminar el uso de papel y hojas de cálculo, ofreciendo una plataforma centralizada donde:

- Los **socios** pueden acceder al recinto mediante un código QR dinámico y reservar sus clases desde el móvil.
- Los **monitores** pueden pasar lista y reportar averías en las máquinas.
- El **administrador** tiene un control total sobre las cuotas, los aforos y el personal.

## 📁 Estructura del Proyecto

El proyecto está construido con React, Vite y TypeScript, siguiendo una arquitectura modular orientada a la escalabilidad:

```text
FITBOX/
 ├── docs/                      
 ├── public/                    
 ├── src/                      
 │    ├── assets/              
 │    ├── components/           
 │    ├    ├── charts
 |    |    ├── common
 |    |    ├── forms
 |    |    ├── ui
 |    |    └── utils
 │    ├── database/     
 |    |    ├── repositories
 │    │    └── supabase/
 │    │         └── Client.ts   
 |    ├── hooks
 │    ├── interfaces/                
 │    ├── layouts/              
 │    ├── locales/                
 │    ├── pages/               
 │    ├── router/                
 │    ├── stores/   
 |    ├── styles  
 |    |      └── index.css  
 |    ├── types
 |    ├── utils          
 │    ├── App.tsx               
 │    └── main.tsx              
 ├── .env                       
 ├── package.json               
 ├── tailwind.config.js         
 └── vite.config.ts             
```
