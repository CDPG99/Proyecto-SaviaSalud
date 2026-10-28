# Revisión de la propuesta de cinco microservicios

Fuente: Estructura de microservicios(1).pdf aportado por el equipo. Se conservan sus cinco dominios y se ajustan responsabilidades para una primera versión orientada a personas afiliadas.

| Servicio propuesto  | Validación y ajuste                                                                                                                                                                       | Implementación                                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Afiliados           | Registro, estado, datos y beneficiarios son coherentes. Se evita un CRUD de todas las personas en la web pública.                                                                         | Cuenta propia, sesión, datos de contacto y grupo familiar. El estado de afiliación es simulado en esta práctica.                                       |
| Citas               | Debe validar afiliado y disponibilidad al confirmar; la consulta inicial no basta.                                                                                                        | Validación de sesión/estado por API. Reserva transaccional, bloqueo de horario, cancelación y reprogramación atómica.                                  |
| Documentos          | Certificados se distinguen de autorizaciones y órdenes. El usuario no emite ni aprueba documentos clínicos. Historia médica completa requiere un dominio clínico que excede este alcance. | Certificado PDF de práctica; solicitudes de autorización, copia de orden e historia clínica; constancia de solicitud. Cada descarga valida al titular. |
| Notificaciones      | “Enviar correos” por sí solo deja sin seguimiento los mensajes y sin manejo de errores.                                                                                                   | Bandeja persistente, leídos, preferencia de correo y envío SMTP opcional. Un id de evento evita duplicar el aviso.                                     |
| Atención al Usuario | Peticiones, quejas, reclamos, sugerencias y seguimiento corresponden a este dominio.                                                                                                      | Radicado, detalle y mensajes propios. Sin inventar respuestas institucionales ni tiempos de resolución.                                                |

## Llaves foráneas y separación de datos

Se conservan llaves foráneas entre sesiones/beneficiarios y usuarios; entre citas y horarios; y entre mensajes y casos. No se crean llaves foráneas de otras bases hacia users: eso acoplaría disponibilidad y cambios de los servicios. Se usa un identificador estable de usuario y la consulta interna al servicio Afiliados.

Una instancia MySQL con cinco bases reduce el esfuerzo local sin convertir todo en un único esquema. El usuario de aplicación tiene permisos de desarrollo sobre las cinco bases; una operación real debe emplear un usuario con permisos por dominio.

## Eventos y complejidad

El diagrama propone bus Kafka/RabbitMQ más auditoría, analytics y data lake. Para cinco servicios y un equipo académico se implementa outbox transaccional por productor y entrega HTTP interna a Notificaciones. No se incluyen dominios adicionales que no son necesarios para los recorridos actuales.

El evento se guarda dentro de la misma transacción del trámite. Un trabajador reintenta entregarlo cada dos segundos. Notificaciones guarda el id como único: si se repite la entrega, no duplica el aviso. Esto conserva la intención orientada a eventos con menos infraestructura.

## Comunicación corregida

- Citas, Documentos, Atención y Notificaciones validan la sesión con Afiliados.
- Afiliados, Citas, Documentos y Atención producen eventos dirigidos a Notificaciones.
- El navegador pasa por el gateway; no puede usar las rutas internas ni establecer el identificador de otra persona.
- No se declara alta disponibilidad ni capacidad de gran volumen: esas propiedades requieren despliegue y pruebas de carga que este prototipo no incorpora.
