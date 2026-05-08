alter table treatments
  add column if not exists first_injection_time time not null default '08:00';

alter table injections
  add column if not exists slot text not null default 'first',
  add column if not exists treatment_day integer not null default 1;

-- Validar que slot solo sea first o second
alter table injections
  drop constraint if exists injections_slot_check;

alter table injections
  add constraint injections_slot_check check (slot in ('first', 'second'));

-- Evitar duplicar el mismo slot en el mismo día de tratamiento
alter table injections
  drop constraint if exists injections_treatment_day_slot_unique;

alter table injections
  add constraint injections_treatment_day_slot_unique
    unique (treatment_id, treatment_day, slot);

-- Validar que treatment_day esté entre 1 y 84
alter table injections
  drop constraint if exists injections_treatment_day_check;

alter table injections
  add constraint injections_treatment_day_check
    check (treatment_day between 1 and 84);

-- Índice para búsquedas rápidas por día y slot
create index if not exists injections_treatment_day_slot_idx
  on injections (treatment_id, treatment_day, slot);
