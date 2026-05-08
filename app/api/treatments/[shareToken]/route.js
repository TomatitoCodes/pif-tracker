import { NextResponse } from 'next/server'

import { requireCurrentUser } from '../../../../lib/auth'
import { getTreatmentWithInjections, updateTreatmentName } from '../../../../lib/treatments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request, { params }) {
  try {
    const user = await requireCurrentUser()
    const treatment = await getTreatmentWithInjections(params.shareToken, user.id)

    if (!treatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    }

    return NextResponse.json({ treatment })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Failed to load treatment', error)
    return NextResponse.json({ error: 'Could not load treatment' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await requireCurrentUser()
    const body = await request.json().catch(() => ({}))
    const treatment = await updateTreatmentName(params.shareToken, user.id, { catName: body.catName })

    if (!treatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    }

    return NextResponse.json({ treatment })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Failed to update treatment', error)
    return NextResponse.json({ error: 'Could not update treatment' }, { status: 500 })
  }
}
