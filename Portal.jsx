import { Link, Icon, PageTitle, Badge } from "../components/ui.jsx";
import { tools, information } from "../data/navigation.js";
export default function Portal({ user, onNavigate }) {
  if (!user)
    return (
      <section className="container public-portal">
        <PageTitle
          eyebrow="AFILIADOS"
          title="Tu espacio, tus servicios."
          description="Elige un trámite o encuentra orientación. Tus datos personales se consultan únicamente al iniciar sesión."
        />
        <div className="public-callout">
          <Icon name="shield" size={34} />
          <div>
            <h2>Todo lo tuyo, en un lugar seguro.</h2>
            <p>Ingresa para ver tu afiliación, citas y documentos.</p>
          </div>
          <Link to="login" onNavigate={onNavigate} className="button">
            Ingresar al portal →
          </Link>
        </div>
        <div className="service-bento">
          {tools.map((t) => (
            <Link
              className="bento-card"
              to={t.route}
              key={t.route}
              onNavigate={onNavigate}
            >
              <Icon name={t.icon} size={30} />
              <h2>{t.title}</h2>
              <p>{t.text}</p>
              <span>Ir al servicio →</span>
            </Link>
          ))}
        </div>
        <h2 className="spaced-title">Antes de ingresar, podemos orientarte.</h2>
        <div className="information-grid">
          {information.map((t) => (
            <Link
              className="information-card"
              to={t.route}
              key={t.route}
              onNavigate={onNavigate}
            >
              <Icon name={t.icon} />
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </Link>
          ))}
        </div>
      </section>
    );
  return (
    <>
      <PageTitle
        eyebrow="QUÉ BUENO TENERTE AQUÍ"
        title={`Hola, ${user.nombres.split(" ")[0]}.`}
        description="Este es tu espacio. ¿Qué necesitas hacer hoy?"
      />
      <section className="welcome-card">
        <div>
          <Badge>{user.estado}</Badge>
          <h2>Tu salud, en tus manos.</h2>
          <p>
            Tu afiliación de práctica está vinculada a tu cuenta. Revisa tus
            datos y mantén actualizada tu información de contacto.
          </p>
          <Link to="perfil" onNavigate={onNavigate} className="text-link">
            Revisar mi información →
          </Link>
        </div>
        <Icon name="leaf" size={110} />
      </section>
      <div className="portal-tools">
        {tools
          .filter((t) => t.route !== "perfil")
          .map((t) => (
            <Link
              key={t.route}
              to={t.route}
              onNavigate={onNavigate}
              className="portal-tool"
            >
              <span className="tool-icon">
                <Icon name={t.icon} />
              </span>
              <div>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
              <Icon name="arrow" />
            </Link>
          ))}
      </div>
      <div className="tip-panel">
        <Icon name="shield" />
        <div>
          <h3>Un trámite a la vez, sin perder el hilo.</h3>
          <p>
            Cada solicitud genera una confirmación en tu bandeja de avisos.
            Puedes volver a consultarla cuando lo necesites.
          </p>
        </div>
      </div>
    </>
  );
}
