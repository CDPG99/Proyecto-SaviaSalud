export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function text(v, label, min = 1, max = 200) {
  if (typeof v !== "string" || v.trim().length < min || v.trim().length > max)
    throw new HttpError(
      400,
      `${label}: escribe entre ${min} y ${max} caracteres.`,
    );
  return v.trim();
}
export function email(v) {
  v = text(v, "Correo", 5, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    throw new HttpError(400, "Escribe un correo válido.");
  return v;
}
export function date(v) {
  v = text(v, "Fecha", 10, 10);
  const d = new Date(`${v}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(v) ||
    !Number.isFinite(d.getTime()) ||
    d.toISOString().slice(0, 10) !== v ||
    v < "1900-01-01" ||
    v > new Date().toISOString().slice(0, 10)
  )
    throw new HttpError(400, "La fecha de nacimiento no es válida.");
  return v;
}
export function choice(v, options, label) {
  if (!options.includes(v)) throw new HttpError(400, `${label} no válido.`);
  return v;
}
export function requireRow(r) {
  if (!r) throw new HttpError(404, "No encontramos la información solicitada.");
  return r;
}
export function contact(b) {
  const telefono = text(b.telefono, "Teléfono", 7, 20);
  if (!/^[+0-9 ()-]+$/.test(telefono))
    throw new HttpError(400, "El teléfono no es válido.");
  return {
    telefono,
    direccion: text(b.direccion, "Dirección", 5, 200),
    ciudad: text(b.ciudad, "Ciudad", 2, 100),
  };
}
