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
export default function Citas() {
  const [tab, setTab] = useState("agendar"),
    [specialty, setSpecialty] = useState(""),
    [day, setDay] = useState(""),
    [selected, setSelected] = useState(null),
    [reschedule, setReschedule] = useState(null),
    [pending, setPending] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const slots = useLoad(() => api("citas", "/disponibilidad")),
    appointments = useLoad(() => api("citas"));
  const filtered = (slots.data || []).filter(
    (s) =>
      (!specialty || s.especialidad === specialty) && (!day || s.fecha === day),
  );
  async function book() {
    setBusy(true);
    setError("");
    try {
      if (reschedule)
        await api("citas", `/${reschedule}/reagendar`, {
          method: "PATCH",
          body: send({ slotId: selected.id }),
        });
      else
        await api("citas", "/", {
          method: "POST",
          body: send({ slotId: selected.id }),
        });
      setMessage(
        reschedule
          ? "Reprogramamos tu cita."
          : "Tu cita de práctica quedó agendada.",
      );
      setReschedule(null);
      setSelected(null);
      await Promise.all([slots.reload(), appointments.reload()]);
      setTab("mis");
    } catch (e) {
      setError(e.message);
      await slots.reload();
      setSelected(null);
    } finally {
      setBusy(false);
    }
  }
  async function cancel() {
    setBusy(true);
    try {
      await api("citas", `/${pending}/cancelar`, {
        method: "PATCH",
        body: send({}),
      });
      setMessage("La cita fue cancelada.");
      setPending(null);
      await Promise.all([slots.reload(), appointments.reload()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        title="Mis citas"
        description="Elige el horario que mejor se ajuste a tu día."
      />
      <div className="tabs" role="tablist" aria-label="Agenda">
        <button
          role="tab"
          aria-selected={tab === "agendar"}
          onClick={() => setTab("agendar")}
        >
          Encontrar una cita
        </button>
        <button
          role="tab"
          aria-selected={tab === "mis"}
          onClick={() => setTab("mis")}
        >
          Mi agenda
        </button>
      </div>
      <Alert>{error}</Alert>
      <Alert success>{message}</Alert>
      {tab === "agendar" ? (
        <>
          <div className="two-col booking-layout">
            <section className="card">
              <h2>
                {reschedule
                  ? "Elige el nuevo horario"
                  : "¿Qué atención necesitas?"}
              </h2>
              <div className="form-grid">
                <Field id="specialty" label="Especialidad">
                  <select
                    id="specialty"
                    value={specialty}
                    onChange={(e) => {
                      setSpecialty(e.target.value);
                      setSelected(null);
                    }}
                  >
                    <option value="">Todas las especialidades</option>
                    {["Medicina general", "Odontología", "Psicología"].map(
                      (v) => (
                        <option key={v}>{v}</option>
                      ),
                    )}
                  </select>
                </Field>
                <Field
                  id="appointment-day"
                  label="Fecha"
                  type="date"
                  value={day}
                  onChange={(e) => {
                    setDay(e.target.value);
                    setSelected(null);
                  }}
                />
              </div>
              <LoadState resource={slots}>
                {filtered.length ? (
                  <div className="slots-list">
                    {filtered.slice(0, 36).map((s) => (
                      <button
                        key={s.id}
                        className={`slot ${selected?.id === s.id ? "chosen" : ""}`}
                        onClick={() => setSelected(s)}
                        aria-pressed={selected?.id === s.id}
                      >
                        <div className="slot-date">
                          <strong>{dateLabel(s.fecha)}</strong>
                          <span>{s.hora}</span>
                        </div>
                        <div>
                          <strong>{s.especialidad}</strong>
                          <small>
                            {s.profesional}
                            <br />
                            {s.sede}
                          </small>
                        </div>
                        <span className="slot-radio" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <Empty icon="calendar" title="Sin horarios para este filtro">
                    Prueba otra fecha o especialidad.
                  </Empty>
                )}
              </LoadState>
            </section>
            <aside className="card booking-summary">
              <span className="tool-icon">
                <Icon name="calendar" />
              </span>
              <h2>Tu próxima cita</h2>
              {selected ? (
                <>
                  <Badge>Horario seleccionado</Badge>
                  <h3>{selected.especialidad}</h3>
                  <p>{selected.profesional}</p>
                  <dl className="details-list">
                    <div>
                      <dt>Fecha</dt>
                      <dd>{dateLabel(selected.fecha)}</dd>
                    </div>
                    <div>
                      <dt>Hora</dt>
                      <dd>{selected.hora}</dd>
                    </div>
                    <div>
                      <dt>Lugar</dt>
                      <dd>{selected.sede}</dd>
                    </div>
                  </dl>
                  <Button disabled={busy} onClick={book}>
                    {busy
                      ? "Guardando…"
                      : reschedule
                        ? "Confirmar nuevo horario"
                        : "Confirmar cita"}
                  </Button>
                </>
              ) : (
                <p className="muted">
                  Selecciona un horario disponible y revisa aquí los detalles
                  antes de confirmar.
                </p>
              )}
              {reschedule && (
                <Button
                  kind="secondary"
                  disabled={busy}
                  onClick={() => {
                    setReschedule(null);
                    setSelected(null);
                  }}
                >
                  Cancelar reprogramación
                </Button>
              )}
              <p className="fine-print">
                Agenda de demostración. No corresponde a una cita médica real.
              </p>
            </aside>
          </div>
        </>
      ) : (
        <LoadState resource={appointments}>
          {appointments.data?.length ? (
            <div className="appointment-list">
              {appointments.data.map((a) => (
                <article key={a.id} className="card appointment">
                  <div className="appointment-date">
                    <strong>{dateLabel(a.fecha)}</strong>
                    <span>{a.hora}</span>
                  </div>
                  <div className="appointment-info">
                    <Badge>{a.estado}</Badge>
                    <h3>{a.especialidad}</h3>
                    <p>
                      {a.profesional} · {a.sede}
                    </p>
                  </div>
                  {a.estado === "Agendada" && (
                    <div className="actions">
                      <Button
                        kind="secondary small"
                        disabled={busy}
                        onClick={() => {
                          setReschedule(a.id);
                          setTab("agendar");
                          setSelected(null);
                        }}
                      >
                        Reprogramar
                      </Button>
                      <Button
                        kind="ghost small"
                        disabled={busy}
                        onClick={() => setPending(a.id)}
                      >
                        Cancelar cita
                      </Button>
                    </div>
                  )}
                  {pending === a.id && (
                    <div
                      className="confirmation"
                      role="alertdialog"
                      aria-label="Cancelar cita"
                    >
                      <p>¿Confirmas que deseas cancelar esta cita?</p>
                      <div className="actions">
                        <Button disabled={busy} onClick={cancel}>
                          Sí, cancelar cita
                        </Button>
                        <Button
                          kind="secondary"
                          onClick={() => setPending(null)}
                        >
                          Conservar cita
                        </Button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <Empty icon="calendar" title="Tu agenda está lista para empezar">
              Encuentra y confirma tu primera cita de práctica.
            </Empty>
          )}
        </LoadState>
      )}
    </>
  );
}
