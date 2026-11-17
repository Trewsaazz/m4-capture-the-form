// Reto bonus: enseña qué registros del servidor ha rechazado Zod y por qué.
export default function AvisoDatosCorruptos({ descartadas }) {
  if (descartadas.length === 0) {
    return null
  }

  return (
    <div className="aviso aviso--alerta" role="status">
      <p>
        {descartadas.length === 1
          ? 'El servidor ha enviado 1 registro corrupto.'
          : `El servidor ha enviado ${descartadas.length} registros corruptos.`}{' '}
        Zod lo ha detectado con safeParse y no se muestra para no romper la interfaz.
      </p>
      <details>
        <summary>Ver qué ha fallado</summary>
        <ul>
          {descartadas.map((registro) => (
            <li key={String(registro.id)}>
              Registro {String(registro.id)}
              <ul>
                {registro.problemas.map((problema) => (
                  <li key={problema}>{problema}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
