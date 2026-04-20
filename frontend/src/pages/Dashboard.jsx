import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

const emptyStats = {
  notaryOffices: 0,
  municipalities: 0,
  votingPlaces: 0,
};

export default function Dashboard({ onLogout, user }) {
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [notaryOfficesRes, municipalitiesRes, votingPlacesRes] =
          await Promise.all([
            api.get("/notary-offices"),
            api.get("/municipalities"),
            api.get("/voting-places"),
          ]);

        setStats({
          notaryOffices: notaryOfficesRes.data.length,
          municipalities: municipalitiesRes.data.length,
          votingPlaces: votingPlacesRes.data.length,
        });
        setError("");
      } catch (err) {
        console.error(err);
        setError("Nao foi possível carregar os dados do backend.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <Layout
      title="Dashboard"
      subtitle="Visualização rápida dos dados principais do sistema."
      onLogout={onLogout}
      user={user}
    >
      <section className="hero-card">
        <div>
          <p className="eyebrow">Resumo</p>
          <h2>Bem-vindo ao Orion!</h2>
          <p className="hero-copy">
            Use os atalhos abaixo para cadastrar e acompanhar cartórios,
            municípios e locais de votação.
          </p>
        </div>
        <div className="action-row">
          <Link className="button primary" to="/notary-offices">
            Ver cartórios
          </Link>
          <Link className="button secondary" to="/places">
            Ver locais
          </Link>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Cartórios</span>
          <strong>{loading ? "..." : stats.notaryOffices}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Municípios</span>
          <strong>{loading ? "..." : stats.municipalities}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Locais de votação</span>
          <strong>{loading ? "..." : stats.votingPlaces}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Atalhos</p>
            <h3>Paginas disponíveis</h3>
          </div>
        </div>

        <div className="link-grid">
          <Link className="quick-link" to="/notary-offices">
            <strong>Cartórios</strong>
            <span>Listagem e cadastro de cartórios eleitorais.</span>
          </Link>
          <Link className="quick-link" to="/municipalities">
            <strong>Municípios</strong>
            <span>Cadastro de municípios ligando-os a um cartório.</span>
          </Link>
          <Link className="quick-link" to="/places">
            <strong>Locais</strong>
            <span>Formulário e lista de locais de votação.</span>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
