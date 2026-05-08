import { NextResponse } from 'next/server'

import { createTreatment } from '../../../lib/treatments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const treatment = await createTreatment({ catName: body.catName })

    return NextResponse.json({ treatment }, { status: 201 })
  } catch (error) {
    console.error('Failed to create treatment', error)
    return NextResponse.json({ error: 'Could not create treatment' }, { status: 500 })
  }
}
