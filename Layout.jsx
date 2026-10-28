import { Link, Icon } from "../ui.jsx";
import { tools } from "../../data/navigation.js";
import "./Layout.css";
export default function Layout({
  children,
  privatePage,
  user,
  page,
  onNavigate,
}) {
  if (!privatePage) return <main id="contenido">{children}</main>;
  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div className="sidebar-profile">
          <span className="avatar">{user.nombres[0]}</span>
          <strong>
            {user.nombres} {user.apellidos}
          </strong>
          <small>Mi espacio de salud</small>
        </div>
        <Link
          to="afiliados"
          onNavigate={onNavigate}
          className={page === "afiliados" ? "selected" : ""}
        >
          <Icon name="home" />
          Resumen
        </Link>
        {tools.map((t) => (
          <Link
            key={t.route}
            to={t.route}
            onNavigate={onNavigate}
            className={page === t.route ? "selected" : ""}
            aria-current={page === t.route ? "page" : undefined}
          >
            <Icon name={t.icon} />
            {t.title}
          </Link>
        ))}
        <div className="sidebar-help">
          <Icon name="heart" />
          <p>¿Necesitas una mano?</p>
          <Link to="ayuda" onNavigate={onNavigate}>
            Visita nuestro centro de ayuda →
          </Link>
        </div>
      </aside>
      <main id="contenido" className="portal-content">
        {children}
      </main>
    </div>
  );
}
