import { redirect } from 'next/navigation'

import AuthForm from '../auth-form'
import { getCurrentUser } from '../../lib/auth'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const user = await getCurrentUser()

  if (user?.share_token) {
    redirect(`/t/${user.share_token}`)
  }

  return (
    <main className="app auth-page">
      <header className="header">
        <img className="brand-logo" src="/logo%20piftracker.webp" alt="PIF Tracker" />
        <p className="home-copy">Continuá el control del tratamiento de tu gato.</p>
      </header>
      <AuthForm mode="login" />
      <p className="auth-switch">¿No tenés cuenta? <a href="/register">Creala acá</a></p>
    </main>
  )
}
