import { NextResponse } from 'next/server'

import { requireCurrentUser } from '../../../lib/auth'
import { createTreatment } from '../../../lib/treatments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const user = await requireCurrentUser()
    const body = await request.json().catch(() => ({}))
    const treatment = await createTreatment({ userId: user.id, catName: body.catName, startDay: body.startDay })

    return NextResponse.json({ treatment }, { status: 201 })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Failed to create treatment', error)
    return NextResponse.json({ error: 'Could not create treatment' }, { status: 500 })
  }
}
