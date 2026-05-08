-- Tabla para rate limiting por clave + ventana de tiempo
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

-- Limpiar ventanas antiguas periódicamente (más de 1 hora)
CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON rate_limits (window_start);

-- CHECK constraint en zona de inyección (solo los 6 valores válidos)
ALTER TABLE injections
  DROP CONSTRAINT IF EXISTS injections_zone_check;

ALTER TABLE injections
  ADD CONSTRAINT injections_zone_check
    CHECK (zone IN ('nuca-izq', 'nuca-der', 'espalda-izq', 'espalda-der', 'lomo-izq', 'lomo-der'));
