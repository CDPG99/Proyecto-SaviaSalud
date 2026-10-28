import { useState, useEffect } from "react";
export function Icon({ name = "arrow", size = 22, ...props }) {
  const paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    calendar:
      "M5 4h14a1 1 0 0 1 1 1v14H4V5a1 1 0 0 1 1-1M8 2v4m8-4v4M4 9h16m-12 4h2m4 0h2m-8 4h2",
    file: "M6 3h8l4 4v14H6zm8 0v5h5M9 12h6m-6 4h6",
    user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2",
    bell: "M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zm5 3h4",
    chat: "M4 4h16v12H9l-5 4zm4 4h8m-8 4h6",
    heart: "M12 20 4 12a5 5 0 0 1 8-6 5 5 0 0 1 8 6z",
    check: "m5 12 4 4L19 6",
    search: "M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0m-2 4 6 6",
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "m6 6 12 12M18 6 6 18",
    home: "m3 11 9-8 9 8M6 9v12h12V9m-9 12v-7h6v7",
    clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-9-5v5l3 2",
    shield: "m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6zm-4 9 3 3 5-6",
    pill: "m5 10 5-5a5 5 0 0 1 7 7l-5 5a5 5 0 0 1-7-7m3-3 9 9",
    download: "M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4",
    leaf: "M20 3C4 1 2 12 7 17s16 1 13-14M5 21 16 9",
    logout: "M10 4H4v16h6m4-5 4-3-4-3m-6 3h10",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.arrow} />
    </svg>
  );
}
export function Link({ to, onNavigate, children, className = "", ...props }) {
  return (
    <a
      href={`#/${to}`}
      className={className}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        onNavigate(to);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
export function Button({ children, kind = "", ...props }) {
  return (
    <button className={`button ${kind}`} {...props}>
      {children}
    </button>
  );
}
export function Alert({ children, success = false }) {
  return children ? (
    <div
      className={`alert ${success ? "success" : ""}`}
      role={success ? "status" : "alert"}
    >
      <Icon name={success ? "check" : "chat"} size={18} />
      <span>{children}</span>
    </div>
  ) : null;
}
export function Field({ label, id, children, ...props }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children || <input id={id} {...props} />}
    </div>
  );
}
export function Badge({ children }) {
  return (
    <span
      className={`badge ${["Cancelada", "Solicitud recibida"].includes(children) ? "neutral" : ""}`}
    >
      {children}
    </span>
  );
}
export const dateLabel = (value) =>
  new Date(String(value).slice(0, 10) + "T12:00:00").toLocaleDateString(
    "es-CO",
    { day: "numeric", month: "short", year: "numeric" },
  );
export function useLoad(loader, deps = []) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  async function reload() {
    setLoading(true);
    setError("");
    try {
      setData(await loader());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let active = true;
    setLoading(true);
    loader()
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, deps);
  return { data, setData, error, setError, loading, reload };
}
export function LoadState({ resource, children }) {
  if (resource.loading)
    return (
      <div className="loading" role="status">
        <span className="spinner" />
        Cargando tu información…
      </div>
    );
  if (resource.error)
    return (
      <>
        <Alert>{resource.error}</Alert>
        <Button kind="secondary" onClick={resource.reload}>
          Reintentar
        </Button>
      </>
    );
  return children;
}
export function Empty({ icon = "file", title, children }) {
  return (
    <div className="empty">
      <Icon name={icon} size={32} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function PageTitle({
  eyebrow = "MI PORTAL",
  title,
  description,
  action,
}) {
  return (
    <div className="page-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
