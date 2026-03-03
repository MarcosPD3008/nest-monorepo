import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Nest Monorepo - Web</h1>
      <p>
        Frontend con React + TypeScript + react-router-dom.
      </p>
      <p>
        API disponible en{' '}
        <a href="http://localhost:3000/api" target="_blank" rel="noreferrer">
          http://localhost:3000/api
        </a>
      </p>
      <nav style={{ marginTop: '1rem' }}>
        <Link to="/about">Acerca de</Link>
      </nav>
    </main>
  );
}
