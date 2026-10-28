import { Link, Icon } from "../ui.jsx";
export default function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <div className="brand">
            <span className="brand-mark">+</span>
            <span>
              virelia<small>tu salud, contigo</small>
            </span>
          </div>
          <p>
            Más claridad. Más cercanía.
            <br />
            Un lugar para cuidar de ti.
          </p>
        </div>
        <div>
          <h3>Tu portal</h3>
          <Link to="afiliados" onNavigate={onNavigate}>
            Servicios para afiliados
          </Link>
          <Link to="citas" onNavigate={onNavigate}>
            Mis citas
          </Link>
          <Link to="documentos" onNavigate={onNavigate}>
            Mis documentos
          </Link>
        </div>
        <div>
          <h3>Estamos cerca</h3>
          <Link to="atencion" onNavigate={onNavigate}>
            Peticiones y solicitudes
          </Link>
          <Link to="ayuda" onNavigate={onNavigate}>
            Centro de ayuda
          </Link>
          <Link to="nosotros" onNavigate={onNavigate}>
            Conoce Virelia
          </Link>
        </div>
        <div className="footer-note">
          <Icon name="shield" />
          <p>
            Tu información pertenece a tu espacio personal. Ingresa para
            consultar tus trámites.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          Virelia · Proyecto académico de migración y modernización web.
        </span>
        <span>Datos, citas y documentos de práctica.</span>
      </div>
    </footer>
  );
}
