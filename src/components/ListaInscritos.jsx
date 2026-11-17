import { useState } from 'react'
import { NIVELES } from '../schemas/inscripcion'
import { useInscripciones } from '../hooks/useInscripciones'
import AvisoDatosCorruptos from './AvisoDatosCorruptos'
import TarjetaInscrito from './TarjetaInscrito'

export default function ListaInscritos() {
  const [nivel, setNivel] = useState('todos')
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } =
    useInscripciones(nivel)

  return (
    <section className="panel" aria-labelledby="titulo-lista" aria-busy={isFetching}>
      <div className="panel__cabecera">
        <h2 id="titulo-lista">Participantes</h2>
        {/* isPending: primera carga. isFetching: cualquier petición, también las de fondo */}
        {isFetching && !isPending && (
          <span className="indicador" role="status">
            Actualizando...
          </span>
        )}
      </div>

      <label className="filtro">
        Nivel
        <select value={nivel} onChange={(evento) => setNivel(evento.target.value)}>
          <option value="todos">Todos</option>
          {NIVELES.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </label>

      {isPending && (
        <div role="status">
          <p className="cargando">Cargando participantes...</p>
          <ul className="lista" aria-hidden="true">
            <li className="tarjeta tarjeta--esqueleto" />
            <li className="tarjeta tarjeta--esqueleto" />
          </ul>
        </div>
      )}

      {isError && (
        <div className="aviso aviso--error" role="alert">
          <p>No se ha podido cargar el listado. {error.message}</p>
          <button type="button" className="boton boton--secundario" onClick={() => refetch()}>
            Reintentar
          </button>
        </div>
      )}

      {data && (
        <>
          <AvisoDatosCorruptos descartadas={data.descartadas} />

          <p className="contador">
            {data.inscripciones.length === 1
              ? '1 participante'
              : `${data.inscripciones.length} participantes`}
          </p>

          {data.inscripciones.length === 0 ? (
            <p className="vacio">Nadie se ha inscrito todavía en este nivel. Puedes ser el primero.</p>
          ) : (
            <ul className={isPlaceholderData ? 'lista lista--antigua' : 'lista'}>
              {data.inscripciones.map((inscripcion) => (
                <TarjetaInscrito key={inscripcion.id} inscripcion={inscripcion} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
