# Elaris - Servicios Escolares

Sistema de gestión de fichas para el departamento de Servicios Escolares de la universidad NovaUniversitas.

## Tecnologías

- **Frontend:** React 18 + TypeScript
- **Build tool:** Vite
- **Estilos:** Tailwind CSS (mismos colores que Elaris: `#1D7B43`)
- **Backend:** Supabase (misma base de datos que el proyecto Elaris)
- **Routing:** React Router DOM
- **Iconos:** Lucide React

## Funcionalidades

### 📊 Dashboard
- Estadísticas generales
- Total de fichas de admisión
- Fichas pendientes
- Fichas aprobadas
- Total de inscripciones

### 📄 Fichas de Admisión
- Lista completa de fichas
- Búsqueda por nombre, apellido o CURP
- Filtro por estatus
- Cambio de estatus (registrado → en_revision → aprobada/rechazada)
- **Envío automático de correo** al cambiar estatus
- Ver detalle completo de la ficha

### 📑 Fichas de Inscripción
- Lista de inscripciones
- Búsqueda por nombre o CURP
- Ver detalle con escolaridad
- Documentos subidos

### 👤 Información Detallada
- Datos personales
- Información médica (tipo de sangre, alergias, enfermedades, lenguas)
- Datos del responsable
- Escolaridad
- Documentos subidos (ver PDF/imágenes)

## Configuración

### Credenciales de Acceso
- **Email:** servicios@elaris.com
- **Contraseña:** Configurada en el archivo `.env`

*Nota: El email debe estar confirmado en Supabase o desactivar la confirmación en Authentication > Settings.*

### Variables de Entorno
Crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de Supabase:
```typescript
VITE_SUPABASE_URL=https://zseduawvdpcfmmllhfxk.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

## Instalación

```bash
cd elaris-servicios
npm install
npm run dev
```

La app estará disponible en `http://localhost:5173`

## Estructura del Proyecto

```
elaris-servicios/
├── src/
│   ├── components/
│   │   └── Layout.tsx          # Barra de navegación
│   ├── pages/
│   │   ├── Login.tsx             # Pantalla de login
│   │   ├── Dashboard.tsx          # Estadísticas
│   │   ├── FichasAdmision.tsx   # Gestión fichas admisión
│   │   ├── FichasInscripcion.tsx # Gestión fichas inscripción
│   │   └── FichaDetalle.tsx      # Detalle completo
│   ├── lib/
│   │   ├── supabase.ts         # Cliente Supabase
│   │   └── colors.ts          # Configuración de colores
│   └── types/
│       └── index.ts            # Tipos TypeScript
└── package.json
```

## Notas Importantes

- Esta app es **independiente** del proyecto Elaris (Astro), pero usa la **misma base de datos Supabase**
- Los colores siguen la identidad visual de Elaris: `#1D7B43` (verde) y `#155f32` (hover)
- Al cambiar el estatus de una ficha, se envía un correo automático al alumno usando Supabase Functions (`resend-email`)
- La app permite gestionar tanto fichas de **admisión** como de **inscripción**

## Autor

Desarrollado para el sistema de admisión de NovaUniversitas.
