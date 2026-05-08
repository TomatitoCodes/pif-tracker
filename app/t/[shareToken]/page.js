import { notFound, redirect } from 'next/navigation'

import TrackerClient from '../../tracker-client'
import { getCurrentUser } from '../../../lib/auth'
import { getTreatmentWithInjections } from '../../../lib/treatments'

export const dynamic = 'force-dynamic'

export default async function TreatmentPage({ params }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const treatment = await getTreatmentWithInjections(params.shareToken, user.id)

  if (!treatment) {
    notFound()
  }

  return <TrackerClient initialTreatment={treatment} />
}
