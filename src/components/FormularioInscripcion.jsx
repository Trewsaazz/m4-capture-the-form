import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CATEGORIAS,
  EDAD_MINIMA,
  LONGITUD_MAX_ALIAS,
  MAX_CATEGORIAS,
  MODALIDADES,
  NIVELES,
  inscripcionFormSchema,
} from '../schemas/inscripcion'
import { ariaCampo } from '../utils/accesibilidad'
import { hoyISO } from '../utils/formato'
import { Campo, GrupoOpciones, MensajeError } from './Campo'

const VALORES_INICIALES = {
  alias: '',
  email: '',
  modalidad: 'solo',
  nombreEquipo: '',
  categorias: [],
  nivel: '',
  fechaNacimiento: '',
  reto: '',
  aceptaNormas: false,
}

export default function FormularioInscripcion() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, submitCount },
  } = useForm({
    resolver: zodResolver(inscripcionFormSchema),
    defaultValues: VALORES_INICIALES,
    // Valida al salir de cada campo y, a partir de ahí, en cada pulsación:
    // no grita mientras escribes por primera vez, pero corrige al momento.
    mode: 'onTouched',
  })

  // De momento no hay API: guardamos el alias enviado para dar feedback.
  const [aliasEnviado, setAliasEnviado] = useState(null)

  // useWatch vuelve a pintar solo cuando cambian estos dos campos.
  const modalidad = useWatch({ control, name: 'modalidad' })
  const alias = useWatch({ control, name: 'alias' })

  const numErrores = Object.keys(errors).length

  // handleSubmit solo llama a esta función si Zod ha dado el visto bueno,
  // y le pasa los datos ya transformados (recortados, email en minúsculas...).
  function enviar(datos) {
    console.info('Inscripción válida:', datos)
    setAliasEnviado(datos.alias)
    reset()
  }

  return (
    <section className="panel" aria-labelledby="titulo-formulario">
      <h2 id="titulo-formulario">Inscripción</h2>
      <p className="panel__intro">
        Todos los campos son obligatorios salvo el nombre de equipo si compites solo.
      </p>

      {/* noValidate: desactiva las burbujas del navegador; los mensajes los pone Zod */}
      <form onSubmit={handleSubmit(enviar)} noValidate>
        {submitCount > 0 && numErrores > 0 && (
          <p className="aviso aviso--error" role="alert">
            {numErrores === 1
              ? 'Hay 1 campo por corregir antes de enviar.'
              : `Hay ${numErrores} campos por corregir antes de enviar.`}
          </p>
        )}

        <fieldset className="formulario__cuerpo">
          <Campo
            nombre="alias"
            etiqueta="Alias"
            ayuda={`Así aparecerás en el marcador. ${alias.length}/${LONGITUD_MAX_ALIAS} caracteres.`}
            error={errors.alias}
          >
            <input
              type="text"
              autoComplete="nickname"
              placeholder="n0p_sled"
              {...ariaCampo('alias', errors.alias, true)}
              {...register('alias')}
            />
          </Campo>

          <Campo nombre="email" etiqueta="Email" error={errors.email}>
            <input
              type="email"
              autoComplete="email"
              placeholder="nombre@dominio.com"
              {...ariaCampo('email', errors.email)}
              {...register('email')}
            />
          </Campo>

          <GrupoOpciones nombre="modalidad" leyenda="Modalidad" error={errors.modalidad}>
            {MODALIDADES.map((opcion) => (
              <label key={opcion.valor} className="opcion">
                <input
                  type="radio"
                  value={opcion.valor}
                  aria-describedby="modalidad-error"
                  {...register('modalidad')}
                />
                <span>{opcion.etiqueta}</span>
              </label>
            ))}
          </GrupoOpciones>

          {modalidad === 'equipo' && (
            <Campo nombre="nombreEquipo" etiqueta="Nombre del equipo" error={errors.nombreEquipo}>
              <input
                type="text"
                placeholder="Segfault Sisters"
                {...ariaCampo('nombreEquipo', errors.nombreEquipo)}
                {...register('nombreEquipo')}
              />
            </Campo>
          )}

          <GrupoOpciones
            nombre="categorias"
            leyenda="Categorías"
            ayuda={`Elige entre 1 y ${MAX_CATEGORIAS}.`}
            error={errors.categorias}
          >
            {CATEGORIAS.map((categoria) => (
              <label key={categoria.valor} className="opcion opcion--chip">
                <input
                  type="checkbox"
                  value={categoria.valor}
                  aria-invalid={errors.categorias ? 'true' : 'false'}
                  aria-describedby="categorias-ayuda categorias-error"
                  {...register('categorias')}
                />
                <span>{categoria.etiqueta}</span>
              </label>
            ))}
          </GrupoOpciones>

          <div className="fila">
            <Campo nombre="nivel" etiqueta="Nivel" error={errors.nivel}>
              <select {...ariaCampo('nivel', errors.nivel)} {...register('nivel')}>
                <option value="" disabled>
                  Elige tu nivel
                </option>
                {NIVELES.map((nivel) => (
                  <option key={nivel.valor} value={nivel.valor}>
                    {nivel.etiqueta}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo
              nombre="fechaNacimiento"
              etiqueta="Fecha de nacimiento"
              ayuda={`Edad mínima: ${EDAD_MINIMA} años.`}
              error={errors.fechaNacimiento}
            >
              <input
                type="date"
                max={hoyISO()}
                autoComplete="bday"
                {...ariaCampo('fechaNacimiento', errors.fechaNacimiento, true)}
                {...register('fechaNacimiento')}
              />
            </Campo>
          </div>

          <Campo
            nombre="reto"
            etiqueta="Reto anti-bots: ¿cuánto es 0x2A en decimal?"
            error={errors.reto}
          >
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              {...ariaCampo('reto', errors.reto)}
              {...register('reto')}
            />
          </Campo>

          <div className={errors.aceptaNormas ? 'campo campo--error' : 'campo'}>
            <label className="opcion">
              <input
                type="checkbox"
                {...ariaCampo('aceptaNormas', errors.aceptaNormas)}
                {...register('aceptaNormas')}
              />
              <span>
                Acepto las normas: no atacar la infraestructura del CTF ni compartir flags.
              </span>
            </label>
            <MensajeError nombre="aceptaNormas" error={errors.aceptaNormas} />
          </div>
        </fieldset>

        {aliasEnviado && (
          <p className="aviso aviso--exito" role="status">
            Datos válidos para {aliasEnviado}. Todavía no se envían a ningún servidor.
          </p>
        )}

        <button type="submit" className="boton">
          Capturar mi plaza
        </button>
      </form>
    </section>
  )
}
