import { NextResponse } from 'next/server'

import { registerUser } from '../../../../lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const result = await registerUser({
    email: body.email,
    password: body.password,
    passwordConfirmation: body.passwordConfirmation,
    catName: body.catName,
    startDay: body.startDay,
    firstInjectionTime: body.firstInjectionTime,
  })

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ shareToken: result.shareToken }, { status: 201 })
}
