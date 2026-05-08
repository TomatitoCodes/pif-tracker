import { NextResponse } from 'next/server'

import { deleteInjection } from '../../../../../../lib/treatments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(_request, { params }) {
  try {
    const deleted = await deleteInjection(params.shareToken, params.injectionId)

    if (!deleted) {
      return NextResponse.json({ error: 'Injection not found' }, { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete injection', error)
    return NextResponse.json({ error: 'Could not delete injection' }, { status: 500 })
  }
}
