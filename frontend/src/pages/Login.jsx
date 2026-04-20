import { useState } from "react";
import api from "../services/api";
import LogoBig from "../assets/img/logo-1920.webp";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      onLogin(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Nao foi possivel realizar o login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-hero">        
        <h1><img src={LogoBig} alt="Logo" className="logoBig" /></h1>
        <p className="login-copy">
          Organize a operação eleitoral com mais clareza, acompanhe os locais de
          votação e mantenha as informações essenciais sempre ao seu alcance.
        </p>

        <div className="login-highlights">
          <div className="highlight-card">
            <strong>Cartórios</strong>
            <span>
              Consulte e mantenha os cartórios eleitorais atualizados em um só lugar.
            </span>
          </div>
          <div className="highlight-card">
            <strong>Municípios</strong>
            <span>
              Visualize e administre os municípios atendidos com mais agilidade.
            </span>
          </div>
          <div className="highlight-card">
            <strong>Locais de Votação</strong>
            <span>
              Cadastre e acompanhe os locais de votação com mais segurança.
            </span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <p className="eyebrow">Acesso</p>
          <h2>Entrar</h2>
          <p className="login-form-copy">
            Informe seu e-mail e sua senha para acessar o painel principal.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              E-mail
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@dominio.com"
              />
            </label>

            <label>
              Senha
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
              />
            </label>

            <button className="button login-button" disabled={loading} type="submit">
              {loading ? "Acessando..." : "Acessar sistema"}
            </button>
          </form>

          {error ? <div className="alert error">{error}</div> : null}
        </div>
      </section>
    </main>
  );
}
