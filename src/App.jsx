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
        <section className="panel">
          <h2>Inscripción</h2>
          <p className="panel__intro">Aquí irá el formulario de inscripción.</p>
        </section>
      </main>

      <footer className="pie">
        Datos servidos por json-server en local. Ningún flag ha sufrido daños durante esta práctica.
      </footer>
    </div>
  )
}
