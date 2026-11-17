// La URL se puede cambiar con un .env.local (VITE_API_URL=...) sin tocar el código.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

// Envoltorio de fetch: convierte los fallos de red y los códigos 4xx/5xx en errores
// con un mensaje legible. fetch por sí solo NO lanza error con un 404 o un 500.
async function peticion(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: opciones.body ? { 'Content-Type': 'application/json' } : undefined,
    })
  } catch {
    throw new Error('No se pudo contactar con la API. ¿Está arrancada con "npm run api"?')
  }

  if (!respuesta.ok) {
    throw new Error(`La API respondió con un error ${respuesta.status}`)
  }
  return respuesta.json()
}

// GET /inscripciones, de la más reciente a la más antigua.
export async function obtenerInscripciones() {
  const parametros = new URLSearchParams({ _sort: 'creadaEn', _order: 'desc' })
  return peticion(`/inscripciones?${parametros}`)
}

// POST /inscripciones. Recibe los datos ya validados por el formulario y envía
// solo lo que el servidor necesita guardar: la fecha de nacimiento, el reto y la
// casilla de las normas se validan en el cliente pero no se almacenan.
export async function crearInscripcion(datosFormulario) {
  const nuevaInscripcion = {
    alias: datosFormulario.alias,
    email: datosFormulario.email,
    modalidad: datosFormulario.modalidad,
    nombreEquipo: datosFormulario.modalidad === 'equipo' ? datosFormulario.nombreEquipo : '',
    categorias: datosFormulario.categorias,
    nivel: datosFormulario.nivel,
    creadaEn: new Date().toISOString(),
  }

  return peticion('/inscripciones', {
    method: 'POST',
    body: JSON.stringify(nuevaInscripcion),
  })
}
