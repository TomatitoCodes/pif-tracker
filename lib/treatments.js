import { randomBytes } from 'crypto'

import { getSql } from './db'
import { ZONE_IDS } from './zones'

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
    notes: row.notes,
    createdAt: row.created_at,
  }
}

export async function createTreatment({ userId, catName, startDay = 1 } = {}) {
  const sql = getSql()
  const normalizedCatName = normalizeCatName(catName)
  const parsedStartDay = Number(startDay)

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
        insert into treatments (user_id, cat_name, share_token, start_day, started_at)
        values (${userId}, ${normalizedCatName}, ${shareToken}, ${parsedStartDay}, ${treatmentStartDate.toISOString().slice(0, 10)}::date)
        returning id, user_id, cat_name, share_token, start_day, started_at::text as started_at, created_at, updated_at
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
    select id, user_id, cat_name, share_token, start_day, started_at::text as started_at, created_at, updated_at
    from treatments
    where share_token = ${shareToken.trim()}
      and user_id = ${userId}
    limit 1
  `
  const treatment = toTreatment(treatmentRows[0])

  if (!treatment) return null

  const injectionRows = await sql`
    select id, treatment_id, zone, injection_date::text as injection_date, notes, created_at
    from injections
    where treatment_id = ${treatment.id}
    order by injection_date desc, created_at desc
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

export async function createInjection(shareToken, userId, { zone, date, notes }) {
  if (!ZONE_IDS.has(zone)) {
    throw new Error('Invalid injection zone')
  }

  if (!isValidDateOnly(date)) {
    throw new Error('Invalid injection date')
  }

  const sql = getSql()
  const rows = await sql`
    insert into injections (treatment_id, zone, injection_date, notes)
    select id, ${zone}, ${date}::date, ${normalizeNotes(notes)}
    from treatments
    where share_token = ${shareToken}
      and user_id = ${userId}
    returning id, treatment_id, zone, injection_date::text as injection_date, notes, created_at
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
