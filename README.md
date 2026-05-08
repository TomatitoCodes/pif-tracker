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

5. Levantá la app:

   ```bash
   npm run dev
   ```

## Variables

- `DATABASE_URL`: conexión pooled de Neon para la app.
- `DATABASE_URL_UNPOOLED`: conexión directa para migraciones o tareas administrativas.

No commitees `.env.local` ni credenciales reales.
