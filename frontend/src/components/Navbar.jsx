import { NavLink } from "react-router-dom";
import Logo from "../assets/img/logo.webp";

const navItems = [
  { to: "/", label: "Painel", end: true },
  { to: "/notary-offices", label: "Cartórios" },
  { to: "/municipalities", label: "Municípios" },
  { to: "/places", label: "Locais" },
  { to: "/users", label: "Usuários" },
  { to: "/routers", label: "Rotas" },
];

export default function Navbar({ onLogout, user }) {
  return (
    <nav className="navbar">
      <div className="brand">
        <img src={Logo} alt="Logo" className="logo" />
      </div>

      <div className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            end={item.end}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
        {user ? <span className="user-pill">{user.name}</span> : null}
        {onLogout ? (
          <button
            className="nav-link nav-logout"
            onClick={onLogout}
            type="button"
          >
            Sair
          </button>
        ) : null}
      </div>
    </nav>
  );
}
