import { NextResponse } from 'next/server'

import { createInjection, getTreatmentWithInjections } from '../../../../../lib/treatments'

export const runtime = 'nodejs'

export async function GET(_request, { params }) {
  try {
    const treatment = await getTreatmentWithInjections(params.shareToken)

    if (!treatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    }

    return NextResponse.json({ injections: treatment.injections })
  } catch (error) {
    console.error('Failed to load injections', error)
    return NextResponse.json({ error: 'Could not load injections' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const body = await request.json().catch(() => ({}))
    const injection = await createInjection(params.shareToken, {
      zone: body.zone,
      date: body.date,
      notes: body.notes,
    })

    if (!injection) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    }

    return NextResponse.json({ injection }, { status: 201 })
  } catch (error) {
    if (error.message === 'Invalid injection zone' || error.message === 'Invalid injection date') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('Failed to create injection', error)
    return NextResponse.json({ error: 'Could not create injection' }, { status: 500 })
  }
}
