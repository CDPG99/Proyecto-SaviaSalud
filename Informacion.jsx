import { useState } from "react";
import { PageTitle, Link, Icon, Button } from "../components/ui.jsx";
const faq = [
  [
    "Mi cuenta",
    "¿Cómo ingreso a mi espacio personal?",
    "Usa el botón Ingresar y escribe el correo y la contraseña con los que creaste tu cuenta. La cuenta de ejemplo está indicada en la página de acceso.",
  ],
  [
    "Mi cuenta",
    "¿Cómo actualizo mis datos de contacto?",
    "Dentro de Mi afiliación puedes cambiar tu teléfono, dirección y ciudad. Solo se actualiza la información de tu propia cuenta.",
  ],
  [
    "Citas",
    "¿Puedo cambiar una cita que ya agendé?",
    "Sí. En Mis citas, abre Mi agenda y selecciona Reprogramar. Elige un horario disponible y confirma el cambio. La agenda es de práctica.",
  ],
  [
    "Citas",
    "¿Qué pasa si un horario deja de estar disponible?",
    "El sistema verifica nuevamente el horario al confirmar. Si otra persona lo ocupó, te pedirá elegir uno diferente.",
  ],
  [
    "Documentos",
    "¿Dónde descargo mi certificado?",
    "En Mis documentos, pulsa Generar certificado y luego Descargar PDF. El archivo está identificado como documento de demostración sin validez legal.",
  ],
  [
    "Documentos",
    "¿Puedo generar una orden médica desde el portal?",
    "No. Puedes solicitar copia de una orden existente. La emisión de órdenes y aprobación de autorizaciones corresponde a profesionales y personal competente, fuera de este portal de práctica.",
  ],
  [
    "Solicitudes",
    "¿Cómo sé que mi PQRS fue recibida?",
    "Al radicarla recibirás una referencia. En Te escuchamos, entra a Mis radicados para consultar el detalle y agregar información.",
  ],
  [
    "Avisos",
    "¿Por qué no recibo correos?",
    "La bandeja Mis avisos funciona dentro del portal. El correo requiere un proveedor configurado y la preferencia habilitada; el sistema no afirma un envío si no se realizó.",
  ],
];
export default function Informacion({ kind, onNavigate }) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("Todas"),
    [checked, setChecked] = useState([]),
    [step, setStep] = useState(0),
    [answer, setAnswer] = useState(""),
    [tab, setTab] = useState("entender");
  if (kind === "ayuda") {
    const shown = faq.filter(
      ([c, q, a]) =>
        (category === "Todas" || c === category) &&
        `${q} ${a}`.toLowerCase().includes(query.toLowerCase()),
    );
    return (
      <section className="container help-page">
        <PageTitle
          eyebrow="CENTRO DE AYUDA"
          title="Una respuesta clara cambia el día."
          description="Encuentra orientación para usar tu portal, paso a paso."
        />
        <div className="help-search">
          <Icon name="search" />
          <label className="sr-only" htmlFor="faq-search">
            Buscar una pregunta
          </label>
          <input
            id="faq-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué necesitas saber?"
          />
        </div>
        <div className="filter-chips" aria-label="Categorías de ayuda">
          {[
            "Todas",
            "Mi cuenta",
            "Citas",
            "Documentos",
            "Solicitudes",
            "Avisos",
          ].map((c) => (
            <button
              key={c}
              className={category === c ? "selected" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="faq-layout">
          <div>
            {shown.map(([c, q, a]) => (
              <details className="faq" key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
            {!shown.length && (
              <p>No encontramos esa pregunta. Prueba con otra palabra.</p>
            )}
          </div>
          <aside className="help-contact">
            <Icon name="chat" size={36} />
            <h2>¿Tu pregunta es diferente?</h2>
            <p>Puedes enviarnos una solicitud desde tu espacio personal.</p>
            <Link to="atencion" onNavigate={onNavigate} className="button">
              Quiero preguntar →
            </Link>
          </aside>
        </div>
      </section>
    );
  }
  if (kind === "medicamentos") {
    const checklist = [
      "Tengo a mano la orden o fórmula correspondiente.",
      "Revisé la información de la solicitud y mis datos de contacto.",
      "Anoté mis preguntas sobre la entrega o el estado de mi trámite.",
    ];
    return (
      <section className="container info-page medication-page">
        <PageTitle
          eyebrow="ORIENTACIÓN · MEDICAMENTOS"
          title="Que el siguiente paso sea más claro."
          description="Organiza lo que necesitas antes de consultar por tus medicamentos."
        />
        <div className="two-col">
          <section className="medication-checklist">
            <span className="tool-icon">
              <Icon name="pill" size={32} />
            </span>
            <h2>Mi lista de preparación</h2>
            <p>
              Marca lo que ya tienes listo. Esta lista es una ayuda personal y
              no envía solicitudes.
            </p>
            <div className="progress-track">
              <span
                style={{
                  width: `${(checked.length / checklist.length) * 100}%`,
                }}
              />
            </div>
            <small>
              {checked.length} de {checklist.length} pasos preparados
            </small>
            {checklist.map((item, i) => (
              <label key={item} className="checklist-item">
                <input
                  type="checkbox"
                  checked={checked.includes(i)}
                  onChange={() =>
                    setChecked(
                      checked.includes(i)
                        ? checked.filter((x) => x !== i)
                        : [...checked, i],
                    )
                  }
                />
                <span>{item}</span>
              </label>
            ))}
            {checked.length === 3 && (
              <p className="success-note">
                <Icon name="check" />
                Ya organizaste tu consulta.
              </p>
            )}
          </section>
          <div className="info-stack">
            <section className="card">
              <p className="eyebrow">¿QUÉ QUIERES HACER?</p>
              <h2>Elige tu siguiente paso</h2>
              <Link
                to="documentos"
                onNavigate={onNavigate}
                className="action-line"
              >
                <Icon name="file" />
                <span>
                  Solicitar revisión de una autorización
                  <small>Tu solicitud queda registrada para seguimiento.</small>
                </span>
                <Icon name="arrow" />
              </Link>
              <Link
                to="atencion"
                onNavigate={onNavigate}
                className="action-line"
              >
                <Icon name="chat" />
                <span>
                  Consultar una dificultad de entrega
                  <small>
                    Describe lo que necesitas y conserva el radicado.
                  </small>
                </span>
                <Icon name="arrow" />
              </Link>
            </section>
            <div className="tip-panel">
              <Icon name="heart" />
              <p>
                Para dudas sobre el uso o cambio de un medicamento, consulta al
                profesional tratante. El portal no formula ni cambia
                tratamientos.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  if (kind === "domiciliaria") {
    const questions = [
      "¿Quieres información general sobre atención en casa?",
      "¿Tu consulta se relaciona con una atención o solicitud existente?",
    ];
    return (
      <section className="container info-page">
        <PageTitle
          eyebrow="ATENCIÓN EN CASA"
          title="Orientación para cuidar más cerca."
          description="Encuentra el camino para plantear tu consulta sobre atención domiciliaria."
        />
        <div className="home-care-grid">
          <div className="home-care-photo">
            <img
              src="/assets/centros/dentro-del-centro-de-salud 2.png"
              alt="Espacio de atención en salud"
            />
            <span>
              Una ruta para tu consulta, sin sustituir una valoración
              profesional.
            </span>
          </div>
          <section className="card care-wizard">
            <p className="eyebrow">TU RUTA DE ORIENTACIÓN</p>
            <span className="step-count">
              Paso {Math.min(step + 1, 2)} de 2
            </span>
            {step === 0 ? (
              <>
                <h2>¿Sobre qué necesitas orientación?</h2>
                {questions.map((q) => (
                  <button
                    className="wizard-option"
                    key={q}
                    onClick={() => {
                      setAnswer(
                        q === questions[0]
                          ? "Información general"
                          : "Consulta de una solicitud",
                      );
                      setStep(1);
                    }}
                  >
                    {q}
                    <Icon name="arrow" />
                  </button>
                ))}
              </>
            ) : (
              <>
                <h2>{answer}</h2>
                <p>
                  {answer === "Información general"
                    ? "Puedes consultar las preguntas frecuentes o enviar una petición de información sobre el servicio."
                    : "Prepara la referencia de tu solicitud y describe lo que necesitas consultar para facilitar la orientación."}
                </p>
                <div className="actions">
                  <Link
                    to="atencion"
                    onNavigate={onNavigate}
                    className="button"
                  >
                    Enviar mi consulta →
                  </Link>
                  <Button kind="secondary" onClick={() => setStep(0)}>
                    Volver
                  </Button>
                </div>
                <p className="fine-print">
                  Este asistente no determina si una persona es elegible para
                  atención domiciliaria ni agenda visitas clínicas.
                </p>
              </>
            )}
          </section>
        </div>
      </section>
    );
  }
  return (
    <section className="container info-page sensitive-page">
      <div className="sensitive-hero">
        <Icon name="heart" size={40} />
        <p className="eyebrow">MUERTE DIGNA · ACOMPAÑAMIENTO</p>
        <h1>
          Hay conversaciones
          <br />
          que merecen tiempo
          <br />
          <em>y mucha cercanía.</em>
        </h1>
        <p>
          Un espacio de orientación sobre acompañamiento y consultas
          relacionadas con el final de la vida.
        </p>
      </div>
      <div className="sensitive-content">
        <div className="tabs">
          <button
            className={tab === "entender" ? "selected" : ""}
            onClick={() => setTab("entender")}
          >
            Quiero orientarme
          </button>
          <button
            className={tab === "acompanar" ? "selected" : ""}
            onClick={() => setTab("acompanar")}
          >
            Estoy acompañando a alguien
          </button>
        </div>
        {tab === "entender" ? (
          <>
            <h2>No tienes que resolver tus preguntas a solas.</h2>
            <p>
              Hablar con el equipo de salud permite expresar tus dudas, conocer
              la información aplicable a tu situación y solicitar acompañamiento
              profesional.
            </p>
            <ul className="calm-list">
              <li>Escribe las preguntas que quieras conversar.</li>
              <li>
                Identifica a la persona o al equipo de salud que puede
                orientarte.
              </li>
              <li>
                Si lo deseas, busca una persona de confianza para acompañarte.
              </li>
            </ul>
          </>
        ) : (
          <>
            <h2>Escuchar también es una forma de acompañar.</h2>
            <p>
              Prepara tus preguntas para el equipo de salud, procura un espacio
              respetuoso y solicita información sobre los canales de
              acompañamiento disponibles.
            </p>
            <p>
              Este contenido es informativo y no define procedimientos ni
              requisitos clínicos o legales.
            </p>
          </>
        )}
        <Link
          to="atencion"
          onNavigate={onNavigate}
          className="button secondary"
        >
          Solicitar información de acompañamiento{" "}
          <Icon name="arrow" size={18} />
        </Link>
      </div>
    </section>
  );
}
