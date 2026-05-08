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
        <div className="header-paw">🐾</div>
        <h1>Crear <span>cuenta</span></h1>
        <p className="home-copy">Guardá el seguimiento de tu gato y retomalo desde cualquier dispositivo.</p>
      </header>
      <AuthForm mode="register" />
      <p className="auth-switch">¿Ya tenés cuenta? <a href="/login">Entrá acá</a></p>
    </main>
  )
}
