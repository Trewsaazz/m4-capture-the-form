import { inscripcionApiSchema } from '../schemas/inscripcion'

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

// Convierte los issues de Zod en frases cortas del tipo "email: Escribe un email válido".
function describirProblemas(error) {
  return error.issues.map((issue) => `${issue.path.join('.') || 'registro'}: ${issue.message}`)
}

// Reto bonus: no nos fiamos del servidor. Cada registro pasa por safeParse;
// los válidos se muestran y los corruptos se apartan con el motivo del fallo.
export function validarListado(datos) {
  if (!Array.isArray(datos)) {
    throw new Error('La API devolvió algo que no es una lista de inscripciones')
  }

  const inscripciones = []
  const descartadas = []
  for (const registro of datos) {
    const resultado = inscripcionApiSchema.safeParse(registro)
    if (resultado.success) {
      inscripciones.push(resultado.data)
    } else {
      descartadas.push({
        id: registro?.id ?? 'sin id',
        problemas: describirProblemas(resultado.error),
      })
    }
  }

  if (descartadas.length > 0) {
    console.warn('[Zod] Registros descartados por datos corruptos:', descartadas)
  }
  return { inscripciones, descartadas }
}

// GET /inscripciones, de la más reciente a la más antigua y, si se pide, filtrado por nivel.
export async function obtenerInscripciones(nivel) {
  const parametros = new URLSearchParams({ _sort: 'creadaEn', _order: 'desc' })
  if (nivel !== 'todos') {
    parametros.set('nivel', nivel)
  }
  const datos = await peticion(`/inscripciones?${parametros}`)
  return validarListado(datos)
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

  const datos = await peticion('/inscripciones', {
    method: 'POST',
    body: JSON.stringify(nuevaInscripcion),
  })

  const resultado = inscripcionApiSchema.safeParse(datos)
  if (!resultado.success) {
    throw new Error('El servidor guardó la inscripción, pero respondió con datos inesperados')
  }
  return resultado.data
}

// DELETE /inscripciones/:id
export async function eliminarInscripcion(id) {
  await peticion(`/inscripciones/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
