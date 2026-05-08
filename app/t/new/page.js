import { redirect } from 'next/navigation'

import { createTreatment } from '../../../lib/treatments'

export const dynamic = 'force-dynamic'

export default async function NewTreatmentPage() {
  const treatment = await createTreatment()
  redirect(`/t/${treatment.shareToken}`)
}
