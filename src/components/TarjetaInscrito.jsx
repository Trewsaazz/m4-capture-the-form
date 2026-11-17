import { CATEGORIAS, NIVELES } from '../schemas/inscripcion'
import { useEliminarInscripcion } from '../hooks/useInscripciones'
import { enmascararEmail, etiquetaDe, formatearFecha } from '../utils/formato'

export default function TarjetaInscrito({ inscripcion }) {
  // Cada tarjeta tiene su propia mutación, así el "Retirando..." solo
  // aparece en la tarjeta que se está borrando y no en todas.
  const eliminar = useEliminarInscripcion()
  const { id, alias, email, modalidad, nombreEquipo, categorias, nivel, creadaEn } = inscripcion

  return (
    <li className="tarjeta">
      <div className="tarjeta__cabecera">
        <span className="tarjeta__alias">{alias}</span>
        <span className={`insignia insignia--${nivel}`}>{etiquetaDe(NIVELES, nivel)}</span>
      </div>

      <p className="tarjeta__meta">
        {modalidad === 'equipo' ? `Equipo ${nombreEquipo}` : 'Compite solo'}
        {' · '}
        {enmascararEmail(email)}
        {' · '}
        <time dateTime={creadaEn}>{formatearFecha(creadaEn)}</time>
      </p>

      <ul className="chips" aria-label="Categorías">
        {categorias.map((categoria) => (
          <li key={categoria} className="chip">
            {etiquetaDe(CATEGORIAS, categoria)}
          </li>
        ))}
      </ul>

      {eliminar.isError && (
        <p className="tarjeta__error" role="alert">
          No se ha podido retirar. {eliminar.error.message}
        </p>
      )}

      <button
        type="button"
        className="boton boton--secundario boton--pequeno"
        onClick={() => eliminar.mutate(id)}
        disabled={eliminar.isPending}
        aria-label={`Retirar la inscripción de ${alias}`}
      >
        {eliminar.isPending ? 'Retirando...' : 'Retirar'}
      </button>
    </li>
  )
}
