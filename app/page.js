export default function Home() {
  return (
    <main className="app home-page">
      <header className="header">
        <div className="header-paw">🐾</div>
        <h1>Tracker <span>PIF</span></h1>
        <p className="home-copy">
          Registro compartible de zonas de inyección para el tratamiento del PIF felino.
        </p>
      </header>

      <section className="home-card">
        <h2>Crear tratamiento</h2>
        <p>
          Generá un link privado para compartir con familia, veterinaria o cuidadores.
        </p>
        <a className="btn-home" href="/t/new">Crear tracker</a>
      </section>
    </main>
  )
}
