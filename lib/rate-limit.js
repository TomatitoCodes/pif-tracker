import { getSql } from './db'

export async function checkRateLimit(key, maxRequests, windowMinutes) {
  const sql = getSql()
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)

  const rows = await sql`
    SELECT count FROM rate_limits
    WHERE key = ${key}
      AND window_start > ${windowStart.toISOString()}
    ORDER BY window_start DESC
    LIMIT 1
  `

  const current = rows[0]?.count ?? 0

  if (current >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  await sql`
    INSERT INTO rate_limits (key, count)
    VALUES (${key}, 1)
    ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1
  `

  return { allowed: true, remaining: maxRequests - current - 1 }
}

export async function cleanupOldRateLimits() {
  const sql = getSql()
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000)

  await sql`DELETE FROM rate_limits WHERE window_start < ${cutoff.toISOString()}`
}
