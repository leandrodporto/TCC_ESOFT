import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Link to="/places">Ir para Locais</Link>
      <br />
      <Link to="/points">Ir para Pontos</Link>
      <br />
      <Link to="/routers">Ir para Rotas</Link>
    </div>
  );
}