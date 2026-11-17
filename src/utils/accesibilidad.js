// Atributos ARIA que necesita cada input para que un lector de pantalla
// sepa si el campo es inválido y lea su ayuda y su mensaje de error.
export function ariaCampo(nombre, error, tieneAyuda = false) {
  const descripciones = [tieneAyuda && `${nombre}-ayuda`, `${nombre}-error`].filter(Boolean)
  return {
    id: nombre,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': descripciones.join(' '),
  }
}
