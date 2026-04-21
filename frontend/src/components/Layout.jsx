import Navbar from "./Navbar";
import { Loading } from "./Loading";

export default function Layout({ title, subtitle, children, onLogout, user, loading = false }) {
  return (
    <div className="page-shell">
      <Navbar onLogout={onLogout} user={user} />
      <header className="page-header">
        <p className="eyebrow">Sistema de Orientação e Roteirização Inteligente</p>
        <h1>{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </header>
      <main className="page-content">{children}</main>
      {loading && <Loading />}
    </div>
  );
}
