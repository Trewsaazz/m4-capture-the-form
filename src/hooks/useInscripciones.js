import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { crearInscripcion, obtenerInscripciones } from '../api/inscripciones'

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

export function useCrearInscripcion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearInscripcion,
    // Se devuelve la promesa para que la mutación siga en "pending" hasta que
    // el listado se haya vuelto a pedir: el botón no se libera antes de tiempo.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clavesInscripciones.todas }),
  })
}
