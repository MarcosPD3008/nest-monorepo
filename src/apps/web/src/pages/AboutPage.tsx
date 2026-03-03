import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Acerca de</h1>
      <p>Monorepo con NestJS (API) y React (frontend) usando Nx.</p>
      <nav style={{ marginTop: '1rem' }}>
        <Link to="/">Inicio</Link>
      </nav>
    </main>
  );
}
