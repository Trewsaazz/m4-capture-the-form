import { useQuery } from '@tanstack/react-query'
import { obtenerInscripciones } from '../api/inscripciones'

// Claves de caché organizadas de lo general a lo concreto, para poder
// invalidar todo lo relacionado con las inscripciones de una vez.
export const clavesInscripciones = {
  todas: ['inscripciones'],
  listado: () => ['inscripciones', 'listado'],
}

export function useInscripciones() {
  return useQuery({
    queryKey: clavesInscripciones.listado(),
    queryFn: obtenerInscripciones,
  })
}
