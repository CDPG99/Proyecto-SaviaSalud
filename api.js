export async function api(service, path = "", options = {}) {
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`/api/${service}${path || "/"}`, {
      ...options,
      credentials: "same-origin",
      signal: controller.signal,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    const body = await res.json();
    if (!res.ok) {
      const e = new Error(
        body.error?.message || "No pudimos completar la solicitud.",
      );
      e.status = res.status;
      throw e;
    }
    return body.data;
  } catch (e) {
    if (e.name === "AbortError" || e instanceof TypeError)
      throw new Error(
        "No pudimos conectar. Inténtalo de nuevo en unos momentos.",
      );
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
export const send = (body) => JSON.stringify(body);
export async function downloadDocument(id) {
  const res = await fetch(`/api/documentos/${id}/pdf`, {
    credentials: "same-origin",
  });
  if (!res.ok) {
    let body = await res.json();
    throw new Error(body.error?.message || "No se pudo descargar.");
  }
  const blob = await res.blob(),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `virelia-${id}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
