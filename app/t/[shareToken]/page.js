import { notFound } from 'next/navigation'

import TrackerClient from '../../tracker-client'
import { getTreatmentWithInjections } from '../../../lib/treatments'

export const dynamic = 'force-dynamic'

export default async function TreatmentPage({ params }) {
  const treatment = await getTreatmentWithInjections(params.shareToken)

  if (!treatment) {
    notFound()
  }

  return <TrackerClient initialTreatment={treatment} />
}
