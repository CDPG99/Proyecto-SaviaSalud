# Contrato HTTP

Base local: http://127.0.0.1:3000/api. Todos los cuerpos JSON usan Content-Type: application/json. Respuestas {data: ...}; errores {error: {message: ...}}. La sesión se recibe en una cookie HttpOnly al registrarse o ingresar. No se pasan ids de usuario desde el navegador para seleccionar registros.

| Servicio       | Método y ruta                          | Función                                   |
| -------------- | -------------------------------------- | ----------------------------------------- |
| Afiliados      | POST /afiliados/registro               | Crear cuenta de práctica y sesión         |
| Afiliados      | POST /afiliados/login                  | Iniciar sesión                            |
| Afiliados      | POST /afiliados/logout                 | Revocar sesión                            |
| Afiliados      | GET /afiliados/me                      | Consultar datos propios                   |
| Afiliados      | PATCH /afiliados/me                    | Actualizar teléfono, dirección y ciudad   |
| Afiliados      | GET/POST /afiliados/beneficiarios      | Consultar/agregar integrantes propios     |
| Afiliados      | DELETE /afiliados/beneficiarios/:id    | Retirar integrante propio                 |
| Citas          | GET /citas/disponibilidad              | Horarios disponibles; filtro especialidad |
| Citas          | GET/POST /citas/                       | Consultar/reservar citas propias          |
| Citas          | PATCH /citas/:id/cancelar              | Cancelar cita propia                      |
| Citas          | PATCH /citas/:id/reagendar             | Cambiar horario propio con slotId         |
| Documentos     | GET/POST /documentos/                  | Consultar/generar/solicitar               |
| Documentos     | GET /documentos/:id/pdf                | Descargar PDF o constancia propia         |
| Notificaciones | GET /notificaciones/                   | Bandeja propia                            |
| Notificaciones | PATCH /notificaciones/:id              | Marcar aviso propio como leído            |
| Notificaciones | PATCH /notificaciones/leer-todas       | Marcar todos los avisos propios           |
| Notificaciones | GET/PATCH /notificaciones/preferencias | Preferencia de correo propia              |
| Atención       | GET/POST /atencion/                    | Consultar/radicar PQRS propias            |
| Atención       | GET /atencion/:id                      | Detalle propio                            |
| Atención       | POST /atencion/:id/mensajes            | Agregar información propia                |

Cada servicio responde GET /<servicio>/health. Las rutas /\_internal/... solo se acceden directamente entre servicios con X-Internal-Key; el gateway las bloquea.

Registro: nombres, apellidos, tipoDocumento (CC/TI/CE/PPT), documento, nacimiento (AAAA-MM-DD), telefono, direccion, ciudad, email, password (8 o más), consentimiento=true.

Cita: {slotId: id obtenido en disponibilidad}. Documento: {tipo: Certificado de afiliación/Autorización/Copia de orden médica/Historia clínica, detalle: texto de al menos 20 caracteres para solicitudes}. PQRS: {tipo: Petición/Queja/Reclamo/Sugerencia, asunto: mínimo 8 caracteres, descripcion: mínimo 20}.

401: sesión ausente/expirada. 403: origen no admitido o afiliación no activa. 404: recurso inexistente o ajeno. 409: duplicado o horario ocupado. 413: solicitud demasiado grande. 429: límite de intentos. 503: dependencia temporalmente no disponible. Los documentos generados no tienen validez clínica o legal.
