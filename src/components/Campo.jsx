// Piezas de presentación del formulario. No saben nada de React Hook Form:
// reciben el error y pintan etiqueta, ayuda y mensaje siempre igual.

export function MensajeError({ nombre, error }) {
  // El párrafo existe siempre (aunque esté vacío) para que aria-live
  // anuncie el mensaje en cuanto aparece.
  return (
    <p id={`${nombre}-error`} className="campo__error" aria-live="polite">
      {error?.message}
    </p>
  )
}

export function Campo({ nombre, etiqueta, ayuda, error, children }) {
  return (
    <div className={error ? 'campo campo--error' : 'campo'}>
      <label htmlFor={nombre}>{etiqueta}</label>
      {children}
      {ayuda && (
        <p id={`${nombre}-ayuda`} className="campo__ayuda">
          {ayuda}
        </p>
      )}
      <MensajeError nombre={nombre} error={error} />
    </div>
  )
}

// Para radios y checkboxes: un fieldset con legend agrupa las opciones
// y el lector de pantalla lee la pregunta antes de cada opción.
export function GrupoOpciones({ nombre, leyenda, ayuda, error, children }) {
  return (
    <fieldset className={error ? 'campo grupo campo--error' : 'campo grupo'}>
      <legend>{leyenda}</legend>
      <div className="grupo__opciones">{children}</div>
      {ayuda && (
        <p id={`${nombre}-ayuda`} className="campo__ayuda">
          {ayuda}
        </p>
      )}
      <MensajeError nombre={nombre} error={error} />
    </fieldset>
  )
}
