import { useState } from "react";
import { api, send, downloadDocument } from "../services/api.js";
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
export default function Documentos() {
  const docs = useLoad(() => api("documentos")),
    [request, setRequest] = useState(""),
    [detail, setDetail] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function create(tipo) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const d = await api("documentos", "/", {
        method: "POST",
        body: send({ tipo, detalle: detail }),
      });
      setMessage(
        tipo === "Certificado de afiliación"
          ? "Tu certificado está listo para descargar."
          : `Recibimos tu solicitud. Referencia: ${d.id.slice(0, 8).toUpperCase()}`,
      );
      setRequest("");
      setDetail("");
      await docs.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function download(id) {
    setError("");
    try {
      await downloadDocument(id);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <PageTitle
        title="Mis documentos"
        description="Solicita lo que necesitas y conserva tus archivos a mano."
      />
      <Alert>{error}</Alert>
      <Alert success>{message}</Alert>
      <div className="document-actions">
        <section className="certificate-feature">
          <Icon name="file" size={38} />
          <p className="eyebrow">LISTO EN POCOS PASOS</p>
          <h2>Certificado de afiliación</h2>
          <p>Genera un PDF con los datos de tu cuenta de práctica.</p>
          <Button
            disabled={busy}
            onClick={() => create("Certificado de afiliación")}
          >
            {busy ? "Generando…" : "Generar certificado"}
            <Icon name="download" size={18} />
          </Button>
          <small>Documento de demostración, sin validez legal.</small>
        </section>
        <section className="card">
          <h2>Solicitar un documento</h2>
          <p className="muted">
            Para documentos que requieren revisión profesional.
          </p>
          {["Autorización", "Copia de orden médica", "Historia clínica"].map(
            (t) => (
              <button
                key={t}
                className="document-request"
                onClick={() => {
                  setRequest(t);
                  setDetail("");
                }}
              >
                <span>
                  <strong>{t}</strong>
                  <small>
                    {t === "Autorización"
                      ? "Presentar una solicitud para revisión."
                      : t === "Historia clínica"
                        ? "Solicitar una copia de tu historia."
                        : "Pedir copia de una orden existente."}
                  </small>
                </span>
                <Icon name="arrow" />
              </button>
            ),
          )}
        </section>
      </div>
      {request && (
        <form
          className="card request-form"
          onSubmit={(e) => {
            e.preventDefault();
            create(request);
          }}
        >
          <h2>{request}</h2>
          <p>
            Describe tu solicitud e indica una referencia si la tienes. El
            usuario no emite órdenes ni aprueba autorizaciones.
          </p>
          <Field id="doc-detail" label="Detalle de la solicitud">
            <textarea
              id="doc-detail"
              rows="4"
              required
              minLength="20"
              maxLength="1500"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </Field>
          <div className="actions">
            <Button disabled={busy}>Enviar solicitud</Button>
            <Button
              kind="secondary"
              type="button"
              onClick={() => setRequest("")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
      <section className="card documents-history">
        <div className="card-heading">
          <Icon name="clock" />
          <h2>Mis archivos y solicitudes</h2>
        </div>
        <LoadState resource={docs}>
          {docs.data?.length ? (
            <ul className="document-list">
              {docs.data.map((d) => (
                <li key={d.id}>
                  <span className="file-icon">
                    <Icon name="file" />
                  </span>
                  <div>
                    <strong>{d.titulo}</strong>
                    <small>
                      {dateLabel(d.created_at)} · <Badge>{d.estado}</Badge>
                    </small>
                  </div>
                  <Button kind="secondary small" onClick={() => download(d.id)}>
                    <Icon name="download" size={17} />
                    {d.estado === "Disponible"
                      ? "Descargar PDF"
                      : "Constancia PDF"}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="Aquí aparecerán tus documentos">
              Genera tu certificado o envía una solicitud para comenzar.
            </Empty>
          )}
        </LoadState>
      </section>
    </>
  );
}
