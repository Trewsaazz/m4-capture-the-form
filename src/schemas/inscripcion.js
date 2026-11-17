import { z } from 'zod'

// Este archivo es la única fuente de verdad de la validación:
// el formulario y las respuestas del API se validan con los esquemas de aquí.

export const CATEGORIAS = [
  { valor: 'web', etiqueta: 'Web' },
  { valor: 'crypto', etiqueta: 'Criptografía' },
  { valor: 'pwn', etiqueta: 'Pwn' },
  { valor: 'reversing', etiqueta: 'Reversing' },
  { valor: 'forense', etiqueta: 'Forense' },
  { valor: 'osint', etiqueta: 'OSINT' },
]

export const NIVELES = [
  { valor: 'novato', etiqueta: 'Novato' },
  { valor: 'intermedio', etiqueta: 'Intermedio' },
  { valor: 'avanzado', etiqueta: 'Avanzado' },
]

export const MODALIDADES = [
  { valor: 'solo', etiqueta: 'Solo' },
  { valor: 'equipo', etiqueta: 'En equipo' },
]

export const EDAD_MINIMA = 16
export const MAX_CATEGORIAS = 3
export const LONGITUD_MAX_ALIAS = 16
const ALIAS_RESERVADOS = ['admin', 'root', 'staff', 'organizacion']
const RESPUESTA_RETO = '42' // 0x2A en hexadecimal = 2 * 16 + 10 = 42

const valoresDe = (opciones) => opciones.map((opcion) => opcion.valor)

// Recibe la fecha tal y como la da un <input type="date"> ("AAAA-MM-DD").
// Se trocea a mano para no depender de la zona horaria de new Date("AAAA-MM-DD").
export function calcularEdad(fechaISO, hoy = new Date()) {
  const [anio, mes, dia] = fechaISO.split('-').map(Number)
  const edad = hoy.getFullYear() - anio
  const yaCumplioEsteAnio =
    hoy.getMonth() + 1 > mes || (hoy.getMonth() + 1 === mes && hoy.getDate() >= dia)
  return yaCumplioEsteAnio ? edad : edad - 1
}

const esFechaPasada = (fechaISO) => new Date(fechaISO) <= new Date()

// Campos que comparten el formulario y los datos guardados en el servidor.
const inscripcionBase = z.object({
  alias: z
    .string()
    .trim()
    .min(1, 'Elige un alias para el marcador')
    .min(3, 'El alias necesita al menos 3 caracteres')
    .max(LONGITUD_MAX_ALIAS, `El alias no puede pasar de ${LONGITUD_MAX_ALIAS} caracteres`)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras sin tilde, números, guion (-) y guion bajo (_)')
    .refine(
      (alias) => !ALIAS_RESERVADOS.includes(alias.toLowerCase()),
      'Ese alias está reservado para la organización',
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Escribe un email válido, por ejemplo nombre@dominio.com')),
  modalidad: z.enum(valoresDe(MODALIDADES), { error: 'Indica si compites solo o en equipo' }),
  nombreEquipo: z
    .string({ error: 'El nombre del equipo tiene que ser texto' })
    .trim()
    .max(24, 'El nombre del equipo no puede pasar de 24 caracteres'),
  categorias: z
    .array(z.enum(valoresDe(CATEGORIAS)), { error: 'Las categorías tienen que ser una lista' })
    .min(1, 'Elige al menos una categoría')
    .max(MAX_CATEGORIAS, `Como máximo ${MAX_CATEGORIAS} categorías: mejor centrarse`),
  nivel: z.enum(valoresDe(NIVELES), { error: 'Elige tu nivel' }),
})

// Solo se usa para saber si modalidad y nombreEquipo son válidos por sí mismos.
const camposDeEquipo = inscripcionBase.pick({ modalidad: true, nombreEquipo: true })

// Esquema del formulario: la base más los campos que solo existen en el cliente.
export const inscripcionFormSchema = inscripcionBase
  .extend({
    fechaNacimiento: z
      .string()
      .min(1, 'Indica tu fecha de nacimiento')
      .refine(esFechaPasada, 'Esa fecha todavía no ha llegado')
      .refine(
        (fecha) => calcularEdad(fecha) >= EDAD_MINIMA,
        `Tienes que tener al menos ${EDAD_MINIMA} años para competir`,
      ),
    reto: z
      .string()
      .trim()
      .min(1, 'Resuelve el reto para demostrar que no eres un bot')
      .refine((respuesta) => respuesta === RESPUESTA_RETO, 'Incorrecto: 0x2A está en base 16'),
    aceptaNormas: z.literal(true, { error: 'Tienes que aceptar las normas para inscribirte' }),
  })
  // Regla entre campos: si compites en equipo, el equipo necesita nombre.
  // "when" hace que se compruebe aunque otros campos aún tengan errores,
  // así el usuario ve todos los fallos a la vez y no por tandas.
  .refine((datos) => datos.modalidad !== 'equipo' || datos.nombreEquipo.length >= 3, {
    message: 'Si compites en equipo, ponle un nombre de al menos 3 caracteres',
    path: ['nombreEquipo'],
    when: (payload) => camposDeEquipo.safeParse(payload.value).success,
  })

// Esquema de lo que devuelve el API: la base más lo que añade el servidor.
export const inscripcionApiSchema = inscripcionBase.extend({
  id: z.union([z.number(), z.string()]),
  creadaEn: z.iso.datetime({ error: 'creadaEn no es una fecha ISO válida' }),
})
