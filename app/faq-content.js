export default function FaqContent() {
  return (
    <>
      <details className="faq-item">
        <summary>¿Por qué hay que crear cuenta?</summary>
        <p>
          Si la usara yo solo no tendría ninguna cuenta. La he hecho para que más gente con gatos con PIF
          pueda usarla. Crear cuenta es solo para que cada persona tenga su propio enlace de seguimiento
          y no se mezclen los tratamientos.
        </p>
      </details>

      <details className="faq-item">
        <summary>¿Por qué pide correo electrónico?</summary>
        <p>
          Es únicamente para que puedas acceder a tu tratamiento. No voy a enviarte nada, no hay
          newsletters, no hay spam. Es literalmente solo para que puedas iniciar sesión.
        </p>
      </details>

      <details className="faq-item">
        <summary>¿Mis datos están seguros?</summary>
        <p>
          Sí. La contraseña se hashea (nadie puede verla, ni siquiera yo), la cookie de sesión
          expira a los 30 días y no se comparte nada con nadie.
        </p>
      </details>

      <details className="faq-item">
        <summary>¿Es gratis?</summary>
        <p>
          Sí, totalmente. La hice en una tarde porque mi gato tiene PIF y necesitaba algo así.
          No hay planes de pago ni nada por el estilo.
        </p>
      </details>

      <details className="faq-item">
        <summary>¿Por qué solo 6 zonas de inyección?</summary>
        <p>
          Son las zonas que recomienda el protocolo estándar de tratamiento del PIF felino.
          Si tu veterinario indica otras, avísame y las añado.
        </p>
      </details>
    </>
  )
}
