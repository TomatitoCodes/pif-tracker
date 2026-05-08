import { NextResponse } from 'next/server'

import { loginUser } from '../../../../lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const result = await loginUser({ email: body.email, password: body.password }, { ip })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    return NextResponse.json({ shareToken: result.shareToken })
  } catch (error) {
    console.error('Failed to login', error)
    return NextResponse.json({ error: 'No se pudo iniciar sesión' }, { status: 500 })
  }
}
