import { useState } from "react";
import { api, send } from "../services/api.js";
import { Field, Button, Alert, Link, Icon } from "../components/ui.jsx";
export default function Acceso({ register, onNavigate, onLogin }) {
  const [form, setForm] = useState({
      email: "",
      password: "",
      nombres: "",
      apellidos: "",
      tipoDocumento: "CC",
      documento: "",
      nacimiento: "",
      telefono: "",
      direccion: "",
      ciudad: "",
      consentimiento: false,
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("El correo y la contraseña son obligatorios.");
      return;
    }
    setBusy(true);
    try {
      const u = await api("afiliados", register ? "/registro" : "/login", {
        method: "POST",
        body: send(
          register ? form : { email: form.email, password: form.password },
        ),
      });
      onLogin(u);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const input = (k, label, type = "text") => (
    <Field
      key={k}
      id={`access-${k}`}
      label={label}
      type={type}
      value={form[k]}
      onChange={(e) => set(k, e.target.value)}
      required
      autoComplete={
        k === "email"
          ? "email"
          : k === "password"
            ? register
              ? "new-password"
              : "current-password"
            : undefined
      }
    />
  );
  return (
    <section className="access-layout container">
      <div className="access-copy">
        <p className="eyebrow">TU ESPACIO PERSONAL</p>
        <h1>
          {register
            ? "Empieza a sentirte más cerca."
            : "Qué bueno verte de nuevo."}
        </h1>
        <p>
          Tus servicios, tus datos y tus trámites. Una cuenta para tenerlos
          siempre a mano.
        </p>
        <div className="access-security">
          <Icon name="shield" size={30} />
          <p>
            Solo tú puedes consultar tus citas, documentos y solicitudes desde
            tu cuenta.
          </p>
        </div>
      </div>
      <form noValidate onSubmit={submit} className="card access-form">
        <h2>{register ? "Crea tu cuenta" : "Ingresa a tu portal"}</h2>
        <p className="muted">
          Usa únicamente datos ficticios en este entorno de práctica.
        </p>
        <Alert>{error}</Alert>
        {register && (
          <div className="form-grid">
            {input("nombres", "Nombres")}
            {input("apellidos", "Apellidos")}
            <Field label="Tipo de documento" id="access-tipo">
              <select
                id="access-tipo"
                value={form.tipoDocumento}
                onChange={(e) => set("tipoDocumento", e.target.value)}
              >
                {["CC", "TI", "CE", "PPT"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            {input("documento", "Número de documento")}
            {input("nacimiento", "Fecha de nacimiento", "date")}
            {input("telefono", "Teléfono")}
            {input("direccion", "Dirección")}
            {input("ciudad", "Ciudad")}
          </div>
        )}
        {input("email", "Correo electrónico", "email")}
        {input("password", "Contraseña", "password")}
        {register && (
          <>
            <small>Mínimo 8 caracteres.</small>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.consentimiento}
                onChange={(e) => set("consentimiento", e.target.checked)}
              />
              Acepto usar datos de prueba para crear mi cuenta en esta
              demostración.
            </label>
          </>
        )}
        <Button disabled={busy} type="submit">
          {busy ? "Un momento…" : register ? "Crear mi cuenta" : "Ingresar"}
          <Icon name="arrow" size={18} />
        </Button>
        <p>
          {register ? "¿Ya tienes una cuenta?" : "¿Aún no tienes cuenta?"}{" "}
          <Link to={register ? "login" : "registro"} onNavigate={onNavigate}>
            {register ? "Ingresar" : "Crear cuenta"}
          </Link>
        </p>
        {!register && (
          <details className="demo-help">
            <summary>¿Quieres explorar con una cuenta de ejemplo?</summary>
            <p>
              Correo: demo@virelia.test
              <br />
              Contraseña: Virelia2026!
            </p>
            <Button
              type="button"
              kind="secondary small"
              onClick={() =>
                setForm({
                  ...form,
                  email: "demo@virelia.test",
                  password: "Virelia2026!",
                })
              }
            >
              Usar estos datos
            </Button>
          </details>
        )}
      </form>
    </section>
  );
}
