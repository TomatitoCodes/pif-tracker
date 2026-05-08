import { NextResponse } from 'next/server'

import { loginUser } from '../../../../lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const result = await loginUser({ email: body.email, password: body.password })

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 401 })
  }

  return NextResponse.json({ shareToken: result.shareToken })
}
