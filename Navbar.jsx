import { useState, useEffect, useRef } from "react";
import { Link, Icon, Button } from "../ui.jsx";
import { tools, information } from "../../data/navigation.js";
import "./Navbar.css";
export default function Navbar({ user, onNavigate, page, onLogout }) {
  const [open, setOpen] = useState(false),
    [mobile, setMobile] = useState(false);
  const ref = useRef();
  useEffect(() => {
    function close(e) {
      if (
        e.key === "Escape" ||
        (e.type === "click" && !ref.current?.contains(e.target))
      ) {
        setOpen(false);
        setMobile(false);
      }
    }
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, []);
  const go = (r) => {
    setOpen(false);
    setMobile(false);
    onNavigate(r);
  };
  return (
    <>
      <div className="practice-bar">
        Entorno académico · los trámites y las citas son de demostración.
      </div>
      <header className="site-header" ref={ref}>
        <div className="header-inner">
          <Link
            to="inicio"
            onNavigate={go}
            className="brand"
            aria-label="Virelia, inicio"
          >
            <span className="brand-mark">+</span>
            <span>
              virelia<small>tu salud, contigo</small>
            </span>
          </Link>
          <button
            className="mobile-toggle"
            aria-label={mobile ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            <Icon name={mobile ? "close" : "menu"} />
          </button>
          <nav
            className={mobile ? "main-nav mobile-open" : "main-nav"}
            aria-label="Navegación principal"
          >
            <Link
              to="inicio"
              onNavigate={go}
              aria-current={page === "inicio" ? "page" : undefined}
            >
              Inicio
            </Link>
            <div className="nav-group">
              <button
                className={open ? "nav-trigger active" : "nav-trigger"}
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls="affiliate-menu"
              >
                Afiliados <span aria-hidden="true">⌄</span>
              </button>
              {open && (
                <div className="mega-menu" id="affiliate-menu">
                  <div>
                    <span className="eyebrow">TU ESPACIO PERSONAL</span>
                    {tools.map((t) => (
                      <Link key={t.route} to={t.route} onNavigate={go}>
                        <Icon name={t.icon} />
                        <span>
                          <strong>{t.title}</strong>
                          <small>{t.text}</small>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="menu-info">
                    <span className="eyebrow">TE ORIENTAMOS</span>
                    {information.map((t) => (
                      <Link key={t.route} to={t.route} onNavigate={go}>
                        {t.title}
                        <Icon size={15} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link to="nosotros" onNavigate={go}>
              Conócenos
            </Link>
            <Link to="ayuda" onNavigate={go}>
              Ayuda
            </Link>
            {user && (
              <button
                className="mobile-logout"
                onClick={() => {
                  setMobile(false);
                  setOpen(false);
                  onLogout();
                }}
              >
                Cerrar sesión
              </button>
            )}
          </nav>
          <div className="header-account">
            {user ? (
              <>
                <Link to="afiliados" onNavigate={go} className="button small">
                  <Icon name="user" size={18} />
                  {user.nombres.split(" ")[0]}
                </Link>
                <button
                  className="icon-button logout"
                  aria-label="Cerrar sesión"
                  onClick={onLogout}
                >
                  <Icon name="logout" />
                </button>
              </>
            ) : (
              <Link to="login" onNavigate={go} className="button small">
                Ingresar <Icon name="arrow" size={17} />
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
