import { Link, Icon } from "../components/ui.jsx";
import { tools, information } from "../data/navigation.js";
export default function Inicio({ onNavigate }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            BIENVENIDO A VIRELIA
          </p>
          <h1>
            Cuidarte empieza
            <br />
            por hacerlo
            <br />
            <em>más sencillo.</em>
          </h1>
          <p>
            Tu salud merece tiempo. Tus trámites, menos pasos.
            <br className="desktop-only" />
            Encuentra todo lo que necesitas en un mismo lugar.
          </p>
          <div className="hero-actions">
            <Link to="afiliados" onNavigate={onNavigate} className="button">
              Explorar mi portal <Icon name="arrow" size={18} />
            </Link>
            <Link to="ayuda" onNavigate={onNavigate} className="text-link">
              ¿Cómo podemos ayudarte?
            </Link>
          </div>
          <div className="hero-reassurance">
            <Icon name="shield" size={18} />
            Tu información, en tu espacio personal.
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/assets/centros/Virelia EPS.png"
            alt="Centro de salud de Virelia"
          />
          <div className="hero-note">
            <span className="round-icon">
              <Icon name="heart" />
            </span>
            <div>
              <strong>Estamos contigo</strong>
              <small>En cada paso de tu cuidado.</small>
            </div>
          </div>
          <span className="visual-label">SALUD QUE SE SIENTE CERCA</span>
        </div>
      </section>
      <section className="home-services container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LO QUE NECESITAS, A TU ALCANCE</p>
            <h2>
              Menos vueltas.
              <br />
              Más soluciones.
            </h2>
          </div>
          <p>
            Elige qué quieres hacer hoy.
            <br />
            Nosotros te acompañamos en el camino.
          </p>
        </div>
        <div className="quick-tools">
          {tools.map((t, i) => (
            <Link
              key={t.route}
              to={t.route}
              onNavigate={onNavigate}
              className="tool-card"
            >
              <span className={`tool-icon tone-${i}`}>
                <Icon name={t.icon} size={26} />
              </span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <Icon name="arrow" size={20} />
            </Link>
          ))}
        </div>
      </section>
      <section className="care-band">
        <div className="container care-inner">
          <img
            src="/assets/centros/Virelia EPS dentro.png"
            alt="Espacio de atención Virelia"
            loading="lazy"
          />
          <div>
            <p className="eyebrow">A TU RITMO, DESDE DONDE ESTÉS</p>
            <h2>
              Un portal pensado
              <br />
              para personas.
            </h2>
            <p>
              Consulta tus datos, elige tus horarios y guarda tus documentos.
              Sin confusiones, con información clara y con el control de tus
              propios trámites.
            </p>
            <ul className="check-list">
              <li>
                <Icon name="check" />
                Agenda de citas con horarios disponibles.
              </li>
              <li>
                <Icon name="check" />
                Certificados y solicitudes en un solo lugar.
              </li>
              <li>
                <Icon name="check" />
                Seguimiento de tus mensajes y radicados.
              </li>
            </ul>
            <Link
              to="registro"
              onNavigate={onNavigate}
              className="button secondary"
            >
              Crear mi cuenta <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container information-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">INFORMACIÓN PARA CUIDARTE</p>
            <h2>Orientación que te acompaña.</h2>
          </div>
          <Link to="ayuda" onNavigate={onNavigate} className="text-link">
            Todas las respuestas <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="information-grid">
          {information.map((t) => (
            <Link
              to={t.route}
              key={t.route}
              onNavigate={onNavigate}
              className="information-card"
            >
              <Icon name={t.icon} size={30} />
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <span>Conocer más →</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="help-banner container">
        <div>
          <p className="eyebrow">TU VOZ IMPORTA</p>
          <h2>Te escuchamos de verdad.</h2>
          <p>
            Cuéntanos qué necesitas y consulta el seguimiento de tu solicitud.
          </p>
        </div>
        <Link to="atencion" onNavigate={onNavigate} className="button">
          Quiero comunicarme <Icon name="arrow" size={18} />
        </Link>
      </section>
    </>
  );
}
