// "trew@gmail.com" -> "t***@gmail.com". El listado es público: no hace falta
// enseñar el email entero de cada participante.
export function enmascararEmail(email) {
  const [usuario, dominio] = email.split('@')
  return `${usuario.slice(0, 1)}***@${dominio}`
}

export function formatearFecha(fechaISO) {
  return new Date(fechaISO).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Busca la etiqueta legible de un valor ("crypto" -> "Criptografía").
export function etiquetaDe(opciones, valor) {
  return opciones.find((opcion) => opcion.valor === valor)?.etiqueta ?? valor
}

// Fecha de hoy en formato "AAAA-MM-DD", el que usa el atributo max de <input type="date">.
export function hoyISO() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}
