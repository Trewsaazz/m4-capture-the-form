import { useInscripciones } from '../hooks/useInscripciones'
import TarjetaInscrito from './TarjetaInscrito'

export default function ListaInscritos() {
  const { data, isPending, isError, error, refetch, isFetching } = useInscripciones()

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
          <p className="contador">
            {data.length === 1
              ? '1 participante'
              : `${data.length} participantes`}
          </p>

          {data.length === 0 ? (
            <p className="vacio">Nadie se ha inscrito todavía. Puedes ser el primero.</p>
          ) : (
            <ul className="lista">
              {data.map((inscripcion) => (
                <TarjetaInscrito key={inscripcion.id} inscripcion={inscripcion} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
