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
export default function Perfil({ user, onUser }) {
  const [form, setForm] = useState({
      telefono: user.telefono,
      direccion: user.direccion,
      ciudad: user.ciudad,
    }),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [adding, setAdding] = useState(false),
    [pending, setPending] = useState(null),
    [member, setMember] = useState({
      nombre: "",
      documento: "",
      parentesco: "Hijo/a",
      nacimiento: "",
    });
  const family = useLoad(() => api("afiliados", "/beneficiarios"));
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const u = await api("afiliados", "/me", {
        method: "PATCH",
        body: send(form),
      });
      onUser(u);
      setMessage("Guardamos tus datos de contacto.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function add(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("afiliados", "/beneficiarios", {
        method: "POST",
        body: send(member),
      });
      setMember({
        nombre: "",
        documento: "",
        parentesco: "Hijo/a",
        nacimiento: "",
      });
      setAdding(false);
      await family.reload();
      setMessage("Integrante agregado a tu grupo de práctica.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    try {
      await api("afiliados", `/beneficiarios/${pending}`, { method: "DELETE" });
      setPending(null);
      await family.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        title="Mi afiliación"
        description="Tu información y la de tu grupo familiar, solo para ti."
      />
      <Alert>{error}</Alert>
      <Alert success>{message}</Alert>
      <section className="identity-card">
        <div>
          <p className="eyebrow">AFILIACIÓN DE PRÁCTICA</p>
          <h2>
            {user.nombres} {user.apellidos}
          </h2>
          <p>
            {user.tipoDocumento} · {user.documento}
          </p>
        </div>
        <div>
          <Badge>{user.estado}</Badge>
          <p>{user.regimen}</p>
          <small>Fecha de nacimiento: {dateLabel(user.nacimiento)}</small>
        </div>
      </section>
      <div className="two-col">
        <form onSubmit={save} className="card">
          <div className="card-heading">
            <Icon name="user" />
            <h2>Datos de contacto</h2>
          </div>
          <p className="muted">
            Actualízalos para mantener tu información al día.
          </p>
          {Object.entries({
            telefono: "Teléfono",
            direccion: "Dirección",
            ciudad: "Ciudad",
          }).map(([k, label]) => (
            <Field
              key={k}
              label={label}
              id={`profile-${k}`}
              value={form[k]}
              required
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          ))}
          <Button disabled={busy}>Guardar cambios</Button>
        </form>
        <section className="card">
          <div className="card-heading">
            <Icon name="heart" />
            <h2>Mi grupo familiar</h2>
          </div>
          <LoadState resource={family}>
            {family.data?.length ? (
              <ul className="family-list">
                {family.data.map((m) => (
                  <li key={m.id}>
                    <span className="avatar small-avatar">{m.nombre[0]}</span>
                    <div>
                      <strong>{m.nombre}</strong>
                      <small>
                        {m.parentesco} · {m.documento}
                      </small>
                    </div>
                    <button
                      disabled={busy}
                      className="text-button danger-text"
                      onClick={() => setPending(m.id)}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon="heart" title="Tu grupo familiar empieza aquí">
                Agrega integrantes de prueba a tu cuenta.
              </Empty>
            )}
          </LoadState>
          {pending && (
            <div
              className="confirmation"
              role="alertdialog"
              aria-label="Confirmar retiro"
            >
              <p>¿Quitar este integrante de tu grupo de práctica?</p>
              <div className="actions">
                <Button disabled={busy} onClick={remove}>
                  Confirmar
                </Button>
                <Button kind="secondary" onClick={() => setPending(null)}>
                  Volver
                </Button>
              </div>
            </div>
          )}
          {!adding ? (
            <Button kind="secondary" onClick={() => setAdding(true)}>
              Agregar integrante
            </Button>
          ) : (
            <form className="compact-form" onSubmit={add}>
              {Object.entries({
                nombre: "Nombre completo",
                documento: "Documento",
                nacimiento: "Fecha de nacimiento",
              }).map(([k, label]) => (
                <Field
                  key={k}
                  id={`member-${k}`}
                  label={label}
                  type={k === "nacimiento" ? "date" : "text"}
                  value={member[k]}
                  required
                  onChange={(e) =>
                    setMember({ ...member, [k]: e.target.value })
                  }
                />
              ))}
              <Field label="Parentesco" id="member-relation">
                <select
                  id="member-relation"
                  value={member.parentesco}
                  onChange={(e) =>
                    setMember({ ...member, parentesco: e.target.value })
                  }
                >
                  {["Hijo/a", "Pareja", "Madre/Padre", "Otro"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <div className="actions">
                <Button disabled={busy}>Guardar integrante</Button>
                <Button
                  type="button"
                  kind="secondary"
                  onClick={() => setAdding(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
