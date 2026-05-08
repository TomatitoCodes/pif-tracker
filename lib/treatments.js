import { randomBytes } from 'crypto'

import { getSql } from './db'
import { ZONE_IDS } from './zones'
import { checkRateLimit } from './rate-limit'

const MAX_CAT_NAME_LENGTH = 30
const MAX_NOTES_LENGTH = 1000

function createShareToken() {
  return randomBytes(12).toString('base64url')
}

function normalizeCatName(catName) {
  const value = typeof catName === 'string' ? catName.trim() : ''

  if (!value) return 'mi gato'
  return value.slice(0, MAX_CAT_NAME_LENGTH)
}

function normalizeNotes(notes) {
  const value = typeof notes === 'string' ? notes.trim() : ''
  return value.slice(0, MAX_NOTES_LENGTH)
}

function isValidDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function toTreatment(row) {
  if (!row) return null

  return {
    id: row.id,
    userId: row.user_id,
    catName: row.cat_name,
    shareToken: row.share_token,
    startDay: row.start_day,
    startedAt: row.started_at,
    firstInjectionTime: row.first_injection_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toInjection(row) {
  return {
    id: row.id,
    treatmentId: row.treatment_id,
    zone: row.zone,
    date: row.injection_date,
    slot: row.slot,
    treatmentDay: row.treatment_day,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

export async function createTreatment({ userId, catName, startDay = 1, firstInjectionTime } = {}) {
  const sql = getSql()
  const normalizedCatName = normalizeCatName(catName)
  const parsedStartDay = Number(startDay)
  const validTime = /^\d{2}:\d{2}$/.test(firstInjectionTime) ? firstInjectionTime : '08:00'

  if (!userId) throw new Error('User is required')

  if (!Number.isInteger(parsedStartDay) || parsedStartDay < 1 || parsedStartDay > 84) {
    throw new Error('Invalid treatment start day')
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const shareToken = createShareToken()
    const treatmentStartDate = new Date()
    treatmentStartDate.setDate(treatmentStartDate.getDate() - (parsedStartDay - 1))

    try {
      const rows = await sql`
        insert into treatments (user_id, cat_name, share_token, start_day, started_at, first_injection_time)
        values (${userId}, ${normalizedCatName}, ${shareToken}, ${parsedStartDay}, ${treatmentStartDate.toISOString().slice(0, 10)}::date, ${validTime}::time)
        returning id, user_id, cat_name, share_token, start_day, started_at::text as started_at, first_injection_time::text as first_injection_time, created_at, updated_at
      `

      return toTreatment(rows[0])
    } catch (error) {
      if (error?.code !== '23505') throw error
    }
  }

  throw new Error('Could not create unique share token')
}

export async function getTreatmentWithInjections(shareToken, userId) {
  if (typeof shareToken !== 'string' || !shareToken.trim()) return null
  if (!userId) return null

  const sql = getSql()
  const treatmentRows = await sql`
    select id, user_id, cat_name, share_token, start_day, started_at::text as started_at, first_injection_time::text as first_injection_time, created_at, updated_at
    from treatments
    where share_token = ${shareToken.trim()}
      and user_id = ${userId}
    limit 1
  `
  const treatment = toTreatment(treatmentRows[0])

  if (!treatment) return null

  const injectionRows = await sql`
    select id, treatment_id, zone, injection_date::text as injection_date, slot, treatment_day, notes, created_at
    from injections
    where treatment_id = ${treatment.id}
    order by treatment_day desc, slot desc, created_at desc
  `

  return {
    ...treatment,
    injections: injectionRows.map(toInjection),
  }
}

export async function updateTreatmentName(shareToken, userId, { catName }) {
  const sql = getSql()
  const normalizedCatName = normalizeCatName(catName)
  const rows = await sql`
    update treatments
    set cat_name = ${normalizedCatName}, updated_at = now()
    where share_token = ${shareToken}
      and user_id = ${userId}
    returning id, user_id, cat_name, share_token, start_day, started_at::text as started_at, created_at, updated_at
  `

  return toTreatment(rows[0])
}

export async function createInjection(shareToken, userId, { zone, date, slot, notes }) {
  const rateKey = `injection:${userId}`
  const rate = await checkRateLimit(rateKey, 30, 60)
  if (!rate.allowed) {
    throw new Error('Too many requests. Try again later.')
  }

  if (!ZONE_IDS.has(zone)) {
    throw new Error('Invalid injection zone')
  }

  if (!isValidDateOnly(date)) {
    throw new Error('Invalid injection date')
  }

  if (slot !== 'first' && slot !== 'second') {
    throw new Error('Invalid injection slot')
  }

  const sql = getSql()
  const treatmentRows = await sql`
    select id, started_at::text as started_at
    from treatments
    where share_token = ${shareToken}
      and user_id = ${userId}
    limit 1
  `

  const treatment = treatmentRows[0]
  if (!treatment) return null

  const startDate = new Date(`${treatment.started_at}T00:00:00Z`)
  const injectionDate = new Date(`${date}T00:00:00Z`)
  const diffMs = injectionDate.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const treatmentDay = diffDays + 1

  if (!Number.isInteger(treatmentDay) || treatmentDay < 1 || treatmentDay > 84) {
    throw new Error('Injection date is outside the treatment window')
  }

  const rows = await sql`
    insert into injections (treatment_id, zone, injection_date, slot, treatment_day, notes)
    values (${treatment.id}, ${zone}, ${date}::date, ${slot}, ${treatmentDay}, ${normalizeNotes(notes)})
    returning id, treatment_id, zone, injection_date::text as injection_date, slot, treatment_day, notes, created_at
  `

  return rows[0] ? toInjection(rows[0]) : null
}

export async function deleteInjection(shareToken, userId, injectionId) {
  const sql = getSql()
  const rows = await sql`
    delete from injections
    using treatments
    where injections.treatment_id = treatments.id
      and treatments.share_token = ${shareToken}
      and treatments.user_id = ${userId}
      and injections.id = ${injectionId}
    returning injections.id
  `

  return rows.length > 0
}
