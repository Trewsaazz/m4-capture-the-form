# Capture The Form

Misión M4 · Full Contact Forms de Desarrollo Web I (U-tad, curso 2026-27).

Aplicación React para inscribirse en un CTF (competición de ciberseguridad «Capture The Flag») y consultar el listado de participantes. El formulario usa React Hook Form con un esquema Zod como única fuente de verdad de la validación, y los datos remotos se gestionan con TanStack Query v5 contra una API REST local servida por json-server.

## Qué hace

- Formulario de inscripción con alias, email, modalidad (solo o en equipo), nombre de equipo condicional, categorías (de 1 a 3), nivel, fecha de nacimiento (mínimo 16 años), un reto anti-bots (0x2A en decimal) y la aceptación de las normas.
- Validación en cliente con mensajes propios en castellano, reglas entre campos y transformaciones (recorte de espacios, email en minúsculas).
- Listado de participantes con filtro por nivel, alta y baja de inscripciones, e invalidación de la caché después de cada cambio.
- Estados de carga, error y éxito visibles tanto en el formulario como en el listado.
- Reto bonus: la respuesta del API también se valida con Zod (`safeParse`) y un registro corrupto incluido a propósito en `db.json` queda descartado y explicado en pantalla.

## Cómo arrancarlo

Requisitos: Node.js 20 o superior y npm.

```bash
npm install

# Terminal 1: API REST en http://localhost:3001 (con 600 ms de retraso para ver los estados de carga)
npm run api

# Terminal 2: la app en http://localhost:5173
npm run dev
```

Otros scripts: `npm run build` (compilación de producción) y `npm run lint` (oxlint).

La API guarda los cambios en `db.json`. Para volver a los datos iniciales basta con `git checkout db.json`. Si se quiere usar otra URL para la API, se puede crear un `.env.local` con `VITE_API_URL=...`.

## Estructura

```
db.json                              Datos de json-server (incluye un registro corrupto a propósito)
src/
  main.jsx                           Punto de entrada y QueryClient
  App.jsx                            Maquetación: formulario y listado
  schemas/inscripcion.js             Esquemas Zod (formulario y respuesta del API) y constantes
  api/inscripciones.js               Peticiones fetch y validación de las respuestas con safeParse
  hooks/useInscripciones.js          Claves de caché, useQuery y useMutation
  components/FormularioInscripcion.jsx  Formulario con React Hook Form y zodResolver
  components/Campo.jsx               Etiqueta, ayuda y mensaje de error accesibles
  components/ListaInscritos.jsx      Listado con filtro y estados de carga/error
  components/TarjetaInscrito.jsx     Una inscripción y su botón de retirar
  components/AvisoDatosCorruptos.jsx Aviso del reto bonus
  utils/accesibilidad.js             Atributos ARIA de cada campo
  utils/formato.js                   Fechas, email enmascarado y etiquetas
```

## Decisiones técnicas

Zod como única fuente de verdad. En `schemas/inscripcion.js` hay un esquema base con los campos que comparten el formulario y el servidor. El esquema del formulario lo extiende con los campos que solo existen en el cliente (fecha de nacimiento, reto y normas) y el esquema del API lo extiende con lo que añade el servidor (`id` y `creadaEn`). Así una regla, por ejemplo la longitud del alias, se escribe una sola vez y vale para los dos lados.

Validación expresiva. El esquema combina `min`, `max`, `regex`, `pipe` (el email se recorta y se pasa a minúsculas antes de validarlo), `refine` para el alias reservado, la edad mínima, la fecha futura y el reto, y `z.literal(true)` para la casilla de normas. La regla entre campos (si compites en equipo, el equipo necesita nombre) es un `refine` sobre el objeto con la opción `when`: por defecto Zod no ejecuta los refinamientos del objeto mientras haya otros campos con errores, y con `when` el usuario ve todos los fallos a la vez en lugar de descubrirlos por tandas.

React Hook Form. Los campos son no controlados (`register`), el esquema se conecta con `zodResolver` y el modo `onTouched` valida al salir de cada campo y después en cada pulsación, para no marcar errores mientras el usuario todavía está escribiendo por primera vez. `useWatch` observa solo la modalidad (para mostrar u ocultar el nombre de equipo) y el alias (para el contador de caracteres).

Accesibilidad. Cada input tiene su `label`; los radios y checkboxes van dentro de `fieldset` con `legend`; los campos con error llevan `aria-invalid` y `aria-describedby` apuntando a su ayuda y a su mensaje; el mensaje de error se anuncia con `aria-live`; al enviar con errores aparece un resumen con `role="alert"` y React Hook Form lleva el foco al primer campo inválido. Mientras se envía, un `fieldset disabled` bloquea todo el formulario.

TanStack Query. Las claves siguen una jerarquía de lo general a lo concreto: `['inscripciones']` y `['inscripciones', 'listado', { nivel }]`. Después de crear o retirar una inscripción se invalida `['inscripciones']`, y como la comparación es por prefijo se refrescan a la vez todos los listados filtrados. El `onSuccess` de la mutación devuelve la promesa de `invalidateQueries`, de modo que el botón sigue en «Enviando...» hasta que el listado nuevo ha llegado. El listado usa `placeholderData: keepPreviousData` para que al cambiar de filtro no parpadee la pantalla, y cada tarjeta tiene su propia mutación de borrado para que el estado «Retirando...» solo afecte a esa tarjeta.

API local con json-server. Se eligió json-server 0.17 frente a una API pública de pruebas como JSONPlaceholder porque esta última no guarda los POST: tras invalidar, el listado volvería del servidor sin la inscripción recién creada. json-server sí persiste los cambios, permite filtrar (`?nivel=novato`) y ordenar (`_sort`, `_order`) y su opción `--delay` hace visibles los estados de carga.

Datos mínimos. La fecha de nacimiento, el reto y la casilla de normas se validan pero no se envían al servidor, y el listado público muestra el email enmascarado (`t***@dominio.com`).

## Reto bonus: validar la respuesta del API

`api/inscripciones.js` pasa cada registro que devuelve el servidor por `inscripcionApiSchema.safeParse`. Los válidos se muestran; los inválidos se apartan junto con los mensajes de Zod y se avisa en pantalla y en la consola.

Para comprobarlo:

1. Arrancar `npm run api` y `npm run dev` y abrir el listado con el filtro «Todos».
2. Aparece un aviso amarillo: el registro 4 de `db.json` es corrupto a propósito (alias de un carácter, email inválido, modalidad «trio», categorías como texto en lugar de lista, nivel «dios», sin nombre de equipo y una fecha que no es ISO).
3. Al desplegar «Ver qué ha fallado» se lista cada campo con su mensaje, y la consola muestra el aviso `[Zod] Registros descartados por datos corruptos`.
4. Como json-server arranca con `--watch`, se puede estropear otro registro en `db.json` con la app abierta y, al recargar, también queda descartado.

La respuesta del POST se valida igual: si el servidor devolviera algo inesperado, la mutación pasa a error con un mensaje claro.

## Uso de IA

Herramienta: Claude (modelo Claude Opus 5.5, de Anthropic), usado desde la app de escritorio de Claude con acceso a mi ordenador.

Qué partes se hicieron con IA: todas. La IA eligió el dominio del formulario, diseñó la estructura de carpetas, escribió el código, los estilos, los datos de ejemplo y este README, preparó el historial de commits y publicó el repositorio en mi cuenta de GitHub usando GitHub Desktop en mi ordenador.

Prompt real usado (junto con el PDF del enunciado de la M4):

```
Tienes que crear una carpeta en mi desktop y pushear a github, todo tu, no te añadas de colaborador.
```

Cómo se verificó lo generado (comprobaciones que hizo la propia IA durante la generación):

- `npm run build` y `npm run lint` sin errores ni avisos.
- Peticiones GET, GET filtrado por nivel, POST y DELETE probadas contra json-server con curl, incluida la cabecera CORS del preflight.
- Esquemas probados en Node con casos válidos e inválidos: formulario vacío, alias con espacios, alias reservado, menor de 16 años, fecha futura, cuatro categorías, reto incorrecto y equipo sin nombre.
- Prueba en un navegador automatizado: errores y foco en el primer campo al enviar vacío, alta correcta con mensaje de éxito y listado actualizado, filtro por nivel, retirar una inscripción, aviso del registro corrupto y mensajes de error con la API apagada.

Qué escribí a mano: ninguna línea del código. Mi trabajo en esta entrega es entenderlo y poder defenderlo.

## Autopsia

1. Descartar los registros corruptos uno a uno en lugar de rechazar la respuesta entera. Cada registro pasa por `safeParse` por separado y solo se apartan los inválidos. La alternativa descartada era validar todo el array de golpe (`z.array(inscripcionApiSchema).parse(datos)`) y mostrar una pantalla de error si fallaba. Esa opción es más estricta y tendría sentido con datos críticos, como pagos, pero aquí una inscripción mal guardada no debería impedir ver las demás. El coste de mi elección es que el usuario ve una lista incompleta; por eso el aviso explica cuántos registros faltan y por qué.

2. Invalidar la caché después de cada mutación en lugar de actualizarla a mano. Tras crear o retirar una inscripción se invalida `['inscripciones']` y el listado se vuelve a pedir al servidor. La alternativa descartada era escribir el resultado directamente en la caché con `setQueryData`, o hacer una actualización optimista. Hay varias listas en caché (una por filtro de nivel) ordenadas por el servidor, y decidir a mano en cuáles entra cada inscripción y en qué posición duplicaría lógica que ya resuelve json-server; con la actualización optimista habría además que deshacer el cambio en `onError`. El coste de mi elección es una petición GET extra después de cada alta o baja y una respuesta algo menos inmediata.
