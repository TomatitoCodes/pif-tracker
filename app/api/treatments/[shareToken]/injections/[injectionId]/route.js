import { NextResponse } from 'next/server'

import { requireCurrentUser } from '../../../../../../lib/auth'
import { deleteInjection } from '../../../../../../lib/treatments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(_request, { params }) {
  try {
    const user = await requireCurrentUser()
    const deleted = await deleteInjection(params.shareToken, user.id, params.injectionId)

    if (!deleted) {
      return NextResponse.json({ error: 'Injection not found' }, { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Failed to delete injection', error)
    return NextResponse.json({ error: 'Could not delete injection' }, { status: 500 })
  }
}
