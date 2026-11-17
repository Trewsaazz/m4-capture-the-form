import FormularioInscripcion from './components/FormularioInscripcion'

export default function App() {
  return (
    <div className="app">
      <header className="cabecera">
        <p className="cabecera__etiqueta">U-tad CTF · temporada 2026-27</p>
        <h1>
          Capture <span>The</span> Form
        </h1>
        <p className="cabecera__lema">
          Valida o muere. Inscríbete, elige tus categorías y entra en el listado de participantes.
        </p>
      </header>

      <main className="rejilla">
        <FormularioInscripcion />
      </main>

      <footer className="pie">
        Datos servidos por json-server en local. Ningún flag ha sufrido daños durante esta práctica.
      </footer>
    </div>
  )
}
