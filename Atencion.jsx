import { useState } from "react";
import { api, send } from "../services/api.js";
import {
  PageTitle,
  Field,
  Button,
  Alert,
  Badge,
  useLoad,
  LoadState,
  Empty,
  dateLabel,
  Icon,
} from "../components/ui.jsx";
export default function Atencion() {
  const cases = useLoad(() => api("atencion")),
    [tab, setTab] = useState("nueva"),
    [form, setForm] = useState({
      tipo: "Petición",
      asunto: "",
      descripcion: "",
    }),
    [detail, setDetail] = useState(null),
    [reply, setReply] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api("atencion", "/", {
        method: "POST",
        body: send(form),
      });
      setMessage(`Tu solicitud quedó radicada: ${result.radicado}.`);
      setForm({ tipo: "Petición", asunto: "", descripcion: "" });
      await cases.reload();
      setTab("mis");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function open(id) {
    try {
      setDetail(await api("atencion", `/${id}`));
    } catch (e) {
      setError(e.message);
    }
  }
  async function respond(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("atencion", `/${detail.id}/mensajes`, {
        method: "POST",
        body: send({ mensaje: reply }),
      });
      setReply("");
      await open(detail.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const types = {
    Petición: "Necesito información o apoyo con un servicio.",
    Queja: "Quiero contar una inconformidad con la atención.",
    Reclamo: "Quiero solicitar revisión de una situación.",
    Sugerencia: "Tengo una idea para mejorar.",
  };
  return (
    <>
      <PageTitle
        title="Te escuchamos"
        description="Cuéntanos qué necesitas. Tu solicitud tendrá un radicado para seguirla."
      />
      <div className="tabs">
        <button
          className={tab === "nueva" ? "selected" : ""}
          onClick={() => setTab("nueva")}
        >
          Nueva solicitud
        </button>
        <button
          className={tab === "mis" ? "selected" : ""}
          onClick={() => setTab("mis")}
        >
          Mis radicados
        </button>
      </div>
      <Alert>{error}</Alert>
      <Alert success>{message}</Alert>
      {tab === "nueva" ? (
        <form className="card pqrs-form" onSubmit={submit}>
          <h2>¿Cómo podemos ayudarte?</h2>
          <div className="request-types">
            {Object.entries(types).map(([type, description]) => (
              <label key={type} className={form.tipo === type ? "chosen" : ""}>
                <input
                  type="radio"
                  name="pqrs-type"
                  value={type}
                  checked={form.tipo === type}
                  onChange={() => setForm({ ...form, tipo: type })}
                />
                <strong>{type}</strong>
                <span>{description}</span>
              </label>
            ))}
          </div>
          <Field
            label="Asunto"
            id="case-subject"
            value={form.asunto}
            required
            minLength="8"
            maxLength="150"
            onChange={(e) => setForm({ ...form, asunto: e.target.value })}
          />
          <Field label="Cuéntanos tu solicitud" id="case-description">
            <textarea
              id="case-description"
              rows="5"
              value={form.descripcion}
              required
              minLength="20"
              maxLength="2000"
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
          </Field>
          <p className="fine-print">
            No incluyas información clínica sensible en esta demostración.
          </p>
          <Button disabled={busy}>
            {busy ? "Enviando…" : "Radicar solicitud"}
            <Icon name="arrow" size={18} />
          </Button>
        </form>
      ) : (
        <LoadState resource={cases}>
          {cases.data?.length ? (
            <div className="case-list">
              {cases.data.map((c) => (
                <button
                  key={c.id}
                  className="card case-row"
                  onClick={() => open(c.id)}
                >
                  <div>
                    <small>
                      {c.radicado} · {dateLabel(c.created_at)}
                    </small>
                    <h3>{c.asunto}</h3>
                    <span>{c.tipo}</span>
                  </div>
                  <Badge>{c.estado}</Badge>
                  <Icon name="arrow" />
                </button>
              ))}
            </div>
          ) : (
            <Empty icon="chat" title="Tus solicitudes estarán aquí">
              Envía tu primera solicitud y consulta el seguimiento.
            </Empty>
          )}
        </LoadState>
      )}
      {detail && (
        <section className="card case-detail">
          <div className="card-heading">
            <h2>{detail.asunto}</h2>
            <button
              className="icon-button"
              aria-label="Cerrar detalle"
              onClick={() => setDetail(null)}
            >
              <Icon name="close" />
            </button>
          </div>
          <p className="eyebrow">{detail.radicado}</p>
          <div className="case-progress">
            <span className="done">1. Radicada</span>
            <span>2. Revisión pendiente</span>
            <span>3. Respuesta pendiente</span>
          </div>
          <p>{detail.descripcion}</p>
          <p className="fine-print">
            La solicitud está recibida. Este portal de práctica no incluye
            gestión de respuestas por personal de la EPS.
          </p>
          {detail.mensajes.map((m) => (
            <blockquote key={m.id}>
              <small>{dateLabel(m.created_at)} · Tu mensaje</small>
              <p>{m.mensaje}</p>
            </blockquote>
          ))}
          <form onSubmit={respond}>
            <Field id="case-reply" label="Agregar información a mi solicitud">
              <textarea
                id="case-reply"
                rows="3"
                required
                minLength="10"
                maxLength="1500"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
            </Field>
            <Button disabled={busy}>Enviar información</Button>
          </form>
        </section>
      )}
    </>
  );
}
