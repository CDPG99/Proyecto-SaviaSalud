import { db, rows } from "../../../../shared/db.js";
export const pool = db("afiliados");
export const publicProfile = (u) => ({
  id: u.id,
  email: u.email,
  nombres: u.nombres,
  apellidos: u.apellidos,
  tipoDocumento: u.tipo_documento,
  documento: u.documento,
  nacimiento: u.nacimiento,
  telefono: u.telefono,
  direccion: u.direccion,
  ciudad: u.ciudad,
  estado: u.estado,
  regimen: u.regimen,
});
export async function profile(id, conn = pool) {
  return (await rows(conn, "SELECT * FROM users WHERE id=?", [id]))[0];
}
