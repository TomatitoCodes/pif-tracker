import { redirect } from 'next/navigation'

import { getCurrentUser } from '../../../lib/auth'
import { createTreatment } from '../../../lib/treatments'

export const dynamic = 'force-dynamic'

export default async function NewTreatmentPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/register')
  }

  if (user.share_token) {
    redirect(`/t/${user.share_token}`)
  }

  const treatment = await createTreatment({ userId: user.id })
  redirect(`/t/${treatment.shareToken}`)
}
