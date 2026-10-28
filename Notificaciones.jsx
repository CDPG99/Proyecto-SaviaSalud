import { useState, useEffect } from "react";
import { api, send } from "../services/api.js";
import {
  PageTitle,
  Button,
  Alert,
  useLoad,
  LoadState,
  Empty,
  dateLabel,
  Icon,
  Link,
} from "../components/ui.jsx";
export default function Notificaciones({ onNavigate }) {
  const list = useLoad(() => api("notificaciones")),
    prefs = useLoad(() => api("notificaciones", "/preferencias")),
    [onlyUnread, setOnlyUnread] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const timer = setInterval(() => {
      api("notificaciones")
        .then((d) => {
          if (active) list.setData(d);
        })
        .catch(() => {});
    }, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  async function read(id) {
    try {
      await api("notificaciones", `/${id}`, {
        method: "PATCH",
        body: send({}),
      });
      await list.reload();
    } catch (e) {
      setError(e.message);
    }
  }
  async function all() {
    try {
      await api("notificaciones", "/leer-todas", {
        method: "PATCH",
        body: send({}),
      });
      await list.reload();
    } catch (e) {
      setError(e.message);
    }
  }
  async function toggle() {
    try {
      await api("notificaciones", "/preferencias", {
        method: "PATCH",
        body: send({ emailEnabled: !prefs.data.emailEnabled }),
      });
      await prefs.reload();
    } catch (e) {
      setError(e.message);
    }
  }
  const visible = (list.data || []).filter((n) => !onlyUnread || !n.leida);
  return (
    <>
      <PageTitle
        title="Mis avisos"
        description="Las actualizaciones de tus trámites, en un solo lugar."
        action={
          <Button kind="secondary small" onClick={list.reload}>
            Actualizar
          </Button>
        }
      />
      <Alert>{error}</Alert>
      <div className="two-col notification-layout">
        <section className="card">
          <div className="notification-toolbar">
            <div className="tabs">
              <button
                className={!onlyUnread ? "selected" : ""}
                onClick={() => setOnlyUnread(false)}
              >
                Todos
              </button>
              <button
                className={onlyUnread ? "selected" : ""}
                onClick={() => setOnlyUnread(true)}
              >
                Sin leer
              </button>
            </div>
            <button className="text-button" onClick={all}>
              Marcar todos como leídos
            </button>
          </div>
          <LoadState resource={list}>
            {visible.length ? (
              <ul className="notification-list">
                {visible.map((n) => (
                  <li key={n.id} className={n.leida ? "" : "unread"}>
                    <span className="notification-dot" />
                    <div>
                      <small>{dateLabel(n.created_at)}</small>
                      <h3>{n.titulo}</h3>
                      <p>{n.mensaje}</p>
                      <div className="actions">
                        <Link
                          to={n.link}
                          onNavigate={(r) => {
                            read(n.id);
                            onNavigate(r);
                          }}
                          className="text-link"
                        >
                          Ver trámite →
                        </Link>
                        {!n.leida && (
                          <button
                            className="text-button muted"
                            onClick={() => read(n.id)}
                          >
                            Marcar como leído
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty
                icon="bell"
                title={onlyUnread ? "Todo al día" : "Aún no hay novedades"}
              >
                Tus confirmaciones aparecerán aquí después de realizar un
                trámite.
              </Empty>
            )}
          </LoadState>
        </section>
        <aside className="card preferences">
          <Icon name="bell" size={28} />
          <h2>A tu manera</h2>
          <p>
            La bandeja conserva tus avisos. También puedes elegir si deseas
            recibir correos.
          </p>
          <LoadState resource={prefs}>
            {prefs.data && (
              <>
                <label className="switch-row">
                  Avisos por correo
                  <input
                    type="checkbox"
                    role="switch"
                    checked={prefs.data.emailEnabled}
                    onChange={toggle}
                  />
                </label>
                <p className="fine-print">
                  {prefs.data.smtpConfigured
                    ? "El envío usa el proveedor de correo configurado."
                    : "En esta demostración los avisos se guardan aquí. El envío por correo requiere configurar un proveedor."}
                </p>
              </>
            )}
          </LoadState>
        </aside>
      </div>
    </>
  );
}
