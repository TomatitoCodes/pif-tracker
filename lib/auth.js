import { cookies } from 'next/headers'
import { pbkdf2Sync, randomBytes, timingSafeEqual, createHash } from 'crypto'

import { getSql } from './db'
import { checkRateLimit, cleanupOldRateLimits } from './rate-limit'

const SESSION_COOKIE = 'pif_session'
const SESSION_DAYS = 30
const PBKDF2_ITERATIONS = 310000
const PBKDF2_KEY_LENGTH = 32
const PBKDF2_DIGEST = 'sha256'

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

function normalizeCatName(catName) {
  const value = typeof catName === 'string' ? catName.trim() : ''
  return value ? value.slice(0, 30) : 'mi gato'
}

function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('base64url')
  const hash = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, PBKDF2_DIGEST).toString('base64url')
  return `pbkdf2_${PBKDF2_DIGEST}$${PBKDF2_ITERATIONS}$${salt}$${hash}`
}

function verifyPassword(password, passwordHash) {
  const [algorithm, iterations, salt, storedHash] = passwordHash.split('$')

  if (algorithm !== `pbkdf2_${PBKDF2_DIGEST}` || !iterations || !salt || !storedHash) {
    return false
  }

  const candidate = pbkdf2Sync(password, salt, Number(iterations), PBKDF2_KEY_LENGTH, PBKDF2_DIGEST)
  const stored = Buffer.from(storedHash, 'base64url')

  return stored.length === candidate.length && timingSafeEqual(stored, candidate)
}

function cookieOptions(expiresAt) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  }
}

async function createSession(userId) {
  const sql = getSql()
  const token = randomBytes(32).toString('base64url')
  const tokenHash = hashSessionToken(token)
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await sql`
    insert into sessions (token_hash, user_id, expires_at)
    values (${tokenHash}, ${userId}, ${expiresAt.toISOString()})
  `

  cookies().set(SESSION_COOKIE, token, cookieOptions(expiresAt))
}

export async function registerUser({ email, password, passwordConfirmation, catName, startDay, firstInjectionTime }, { ip } = {}) {
  const sql = getSql()
  const normalizedEmail = normalizeEmail(email)
  const parsedStartDay = Number(startDay)
  const normalizedCatName = normalizeCatName(catName)

  if (!isValidEmail(normalizedEmail)) {
    return { error: 'Ingresá un email válido' }
  }

  if (!isValidPassword(password)) {
    return { error: 'La contraseña debe tener entre 8 y 128 caracteres' }
  }

  if (password !== passwordConfirmation) {
    return { error: 'Las contraseñas no coinciden' }
  }

  if (!Number.isInteger(parsedStartDay) || parsedStartDay < 1 || parsedStartDay > 84) {
    return { error: 'Elegí un día de tratamiento entre 1 y 84' }
  }

  const rateKey = `register:${ip || 'unknown'}`
  const rate = await checkRateLimit(rateKey, 3, 60)
  if (!rate.allowed) {
    return { error: 'Demasiadas cuentas creadas. Intentá de nuevo en una hora.' }
  }

  const validTime = /^\d{2}:\d{2}$/.test(firstInjectionTime) ? firstInjectionTime : '08:00'

  const passwordHash = hashPassword(password)
  const shareToken = randomBytes(12).toString('base64url')
  const treatmentStartDate = new Date()
  treatmentStartDate.setDate(treatmentStartDate.getDate() - (parsedStartDay - 1))

  try {
    const rows = await sql`
      with new_user as (
        insert into users (email, password_hash)
        values (${normalizedEmail}, ${passwordHash})
        returning id, email
      ),
      new_treatment as (
        insert into treatments (user_id, cat_name, share_token, start_day, started_at, first_injection_time)
        select id, ${normalizedCatName}, ${shareToken}, ${parsedStartDay}, ${treatmentStartDate.toISOString().slice(0, 10)}::date, ${validTime}::time
        from new_user
        returning id, share_token
      )
      select new_user.id as user_id, new_treatment.share_token
      from new_user, new_treatment
    `

    await createSession(rows[0].user_id)
    return { shareToken: rows[0].share_token }
  } catch (error) {
    if (error?.code === '23505') {
      return { error: 'Ya existe una cuenta con ese email' }
    }

    console.error('Failed to register user', error)
    return { error: 'No se pudo crear la cuenta' }
  }
}

export async function loginUser({ email, password }, { ip } = {}) {
  const sql = getSql()
  const normalizedEmail = normalizeEmail(email)

  const rateKey = `login:${normalizedEmail || 'unknown'}`
  const rate = await checkRateLimit(rateKey, 5, 15)
  if (!rate.allowed) {
    return { error: 'Demasiados intentos. Esperá 15 minutos e intentá de nuevo.' }
  }

  const rows = await sql`
    select users.id, users.password_hash, treatments.share_token, treatments.first_injection_time::text as first_injection_time
    from users
    left join treatments on treatments.user_id = users.id
    where users.email = ${normalizedEmail}
    limit 1
  `
  const user = rows[0]

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: 'Email o contraseña incorrectos' }
  }

  await cleanupOldRateLimits().catch(() => {})
  await sql`DELETE FROM sessions WHERE expires_at < now()`.catch(() => {})

  await createSession(user.id)
  return { shareToken: user.share_token }
}

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value

  if (!token) return null

  let rows

  try {
    const sql = getSql()
    rows = await sql`
      select users.id, users.email, treatments.share_token, treatments.first_injection_time::text as first_injection_time
      from sessions
      join users on users.id = sessions.user_id
      left join treatments on treatments.user_id = users.id
      where sessions.token_hash = ${hashSessionToken(token)}
        and sessions.expires_at > now()
      limit 1
    `
  } catch (error) {
    console.error('Failed to load current user', error)
    return null
  }

  return rows[0] || null
}

export async function requireCurrentUser() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function logoutUser() {
  const token = cookies().get(SESSION_COOKIE)?.value

  if (token) {
    const sql = getSql()
    await sql`delete from sessions where token_hash = ${hashSessionToken(token)}`
  }

  cookies().delete(SESSION_COOKIE)
}
