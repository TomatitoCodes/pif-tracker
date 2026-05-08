import FaqContent from './faq-content'

export default function Home() {
  return (
    <main className="app home-page">
      <header className="header">
        <img className="brand-logo" src="/logo%20piftracker.webp" alt="PIF Tracker" />
        <p className="home-copy">
          Registro compartible de zonas de inyección para el tratamiento del PIF felino.
        </p>
      </header>

      <section className="home-card">
        <h2>Crear tratamiento</h2>
        <p>
          Genera un enlace privado para compartir con familia, veterinaria o cuidadores.
        </p>
        <div className="home-actions">
          <a className="btn-home" href="/register">Crear cuenta</a>
          <a className="btn-secondary" href="/login">Ya tengo cuenta</a>
        </div>
      </section>

      <section className="home-faq">
        <h2>Preguntas frecuentes</h2>
        <FaqContent />
      </section>
    </main>
  )
}
