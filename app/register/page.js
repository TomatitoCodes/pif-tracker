import { redirect } from 'next/navigation'

import AuthForm from '../auth-form'
import { getCurrentUser } from '../../lib/auth'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const user = await getCurrentUser()

  if (user?.share_token) {
    redirect(`/t/${user.share_token}`)
  }

  return (
    <main className="app auth-page">
      <header className="header">
        <img className="brand-logo" src="/logo%20piftracker.webp" alt="PIF Tracker" />
        <p className="home-copy">Guarda el seguimiento de tu gato y retómalo desde cualquier dispositivo.</p>
      </header>
      <AuthForm mode="register" />
      <p className="auth-switch">¿Ya tienes cuenta? <a href="/login">Entra aquí</a></p>
    </main>
  )
}
