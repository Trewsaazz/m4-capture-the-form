import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  crearInscripcion,
  eliminarInscripcion,
  obtenerInscripciones,
} from '../api/inscripciones'

// Claves de caché organizadas de lo general a lo concreto:
//   ['inscripciones']                                  todo lo relacionado
//   ['inscripciones', 'listado', { nivel: 'novato' }]  un listado filtrado
// Invalidar ['inscripciones'] marca como obsoletos todos los listados a la vez,
// porque TanStack Query compara las claves por prefijo.
export const clavesInscripciones = {
  todas: ['inscripciones'],
  listado: (nivel) => ['inscripciones', 'listado', { nivel }],
}

export function useInscripciones(nivel) {
  return useQuery({
    queryKey: clavesInscripciones.listado(nivel),
    queryFn: () => obtenerInscripciones(nivel),
    // Al cambiar de filtro se sigue mostrando la lista anterior mientras llega la nueva,
    // en vez de vaciar la pantalla y enseñar otra vez el "Cargando".
    placeholderData: keepPreviousData,
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

export function useEliminarInscripcion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eliminarInscripcion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clavesInscripciones.todas }),
  })
}
