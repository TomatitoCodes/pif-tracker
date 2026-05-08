'use client'

import { useState } from 'react'

export default function AuthForm({ mode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [catName, setCatName] = useState('')
  const [startDay, setStartDay] = useState('1')
  const [firstInjectionTime, setFirstInjectionTime] = useState('08:00')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const isRegister = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch(`/api/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, passwordConfirmation, catName, startDay, firstInjectionTime }),
      })
      const payload = await response.json()

      if (!response.ok) {
        setError(payload.error || 'No se pudo continuar')
        return
      }

      window.location.href = `/t/${payload.shareToken}`
    } catch {
      setError('No se pudo conectar con el servidor')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <label>
        Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </label>

      {isRegister && (
        <label>
          Nombre del gato
          <input value={catName} onChange={e => setCatName(e.target.value)} maxLength={30} required />
        </label>
      )}

      {isRegister && (
        <label>
          ¿Por qué día del tratamiento empiezas en la aplicación?
          <select value={startDay} onChange={e => setStartDay(e.target.value)}>
            {Array.from({ length: 84 }, (_, index) => index + 1).map(day => (
              <option key={day} value={day}>Día {day}</option>
            ))}
          </select>
        </label>
      )}

      {isRegister && (
        <label>
          Horario de la primera inyección diaria
          <input
            type="time"
            value={firstInjectionTime}
            onChange={e => setFirstInjectionTime(e.target.value)}
            required
          />
        </label>
      )}

      <label>
        Contraseña
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
      </label>

      {isRegister && (
        <label>
          Repetir contraseña
          <input
            type="password"
            value={passwordConfirmation}
            onChange={e => setPasswordConfirmation(e.target.value)}
            minLength={8}
            required
          />
        </label>
      )}

      {error && <p className="auth-error">{error}</p>}

      <button className="btn-log" type="submit" disabled={submitting}>
        {submitting ? 'Guardando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
      </button>

      {!isRegister && (
        <button type="button" className="auth-forgot" onClick={() => setShowForgot(true)}>
          ¿Has olvidado tu contraseña?
        </button>
      )}

      <dialog className="forgot-dialog" open={showForgot} onClose={() => setShowForgot(false)}>
        <div className="forgot-dialog-content">
          <button className="forgot-close" onClick={() => setShowForgot(false)}>×</button>
          <h3>Recuperar contraseña</h3>
          <p>No hay recuperación automática. Envíame un correo a:</p>
          <a href="mailto:hola@garciagarcia.cc?subject=Recuperar%20contraseña%20PIF%20Tracker">hola@garciagarcia.cc</a>
          <p className="forgot-hint">Dime tu correo de registro y te ayudo.</p>
        </div>
      </dialog>
    </form>
  )
}
