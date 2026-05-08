import { NextResponse } from 'next/server'

import { getTreatmentWithInjections, updateTreatmentName } from '../../../../lib/treatments'

export const runtime = 'nodejs'

export async function GET(_request, { params }) {
  try {
    const treatment = await getTreatmentWithInjections(params.shareToken)

    if (!treatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    }

    return NextResponse.json({ treatment })
  } catch (error) {
    console.error('Failed to load treatment', error)
    return NextResponse.json({ error: 'Could not load treatment' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json().catch(() => ({}))
    const treatment = await updateTreatmentName(params.shareToken, { catName: body.catName })

    if (!treatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    }

    return NextResponse.json({ treatment })
  } catch (error) {
    console.error('Failed to update treatment', error)
    return NextResponse.json({ error: 'Could not update treatment' }, { status: 500 })
  }
}
