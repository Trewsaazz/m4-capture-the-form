import { CATEGORIAS, NIVELES } from '../schemas/inscripcion'
import { enmascararEmail, etiquetaDe, formatearFecha } from '../utils/formato'

export default function TarjetaInscrito({ inscripcion }) {
  const { alias, email, modalidad, nombreEquipo, categorias, nivel, creadaEn } = inscripcion

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
    </li>
  )
}
