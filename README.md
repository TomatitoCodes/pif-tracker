# PIF Tracker

Tracking de inyecciones GS45 para tu gatito.

## Desarrollo local

1. Instalá dependencias:

   ```bash
   npm install
   ```

2. Copiá las variables de entorno:

   ```bash
   cp .env.example .env.local
   ```

3. Configurá `DATABASE_URL` con la URL pooled de Neon.

4. Creá las tablas ejecutando `db/schema.sql` en el SQL Editor de Neon.

   Si ya tenías la primera versión de la base, ejecutá también:

   ```txt
   db/002-auth-and-calendar.sql
   ```

5. Levantá la app:

   ```bash
   npm run dev
   ```

## Variables

- `DATABASE_URL`: conexión pooled de Neon para la app.
- `DATABASE_URL_UNPOOLED`: conexión directa para migraciones o tareas administrativas.

No commitees `.env.local` ni credenciales reales.

## Modelo de acceso

La app requiere cuenta con email y contraseña. Cada usuario tiene su tratamiento y el día inicial del plan de 84 días, para poder empezar el seguimiento aunque ya haya comenzado el tratamiento.
