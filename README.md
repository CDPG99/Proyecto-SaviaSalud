# Virelia · Tu salud, contigo

Portal de una EPS modernizado en React, con cinco microservicios Node.js y persistencia real en MySQL. La interfaz pública ofrece orientación; al ingresar, cada persona solo ve sus datos, citas, documentos, avisos y solicitudes. No hay panel de administración ni listado público de personas.

## Qué cambia

- Identidad original conservada: amarillo #F5C400, azul #1457D9, azul oscuro #174F67 y blanco.
- Inicio y navegación rediseñados para escritorio y móvil; menú de Afiliados organizado por tareas.
- Medicamentos: lista interactiva de preparación. Atención en casa: asistente de orientación. Acompañamiento: contenido específico y navegación por necesidades. Ayuda: búsqueda y categorías.
- Cuenta personal con registro, inicio/cierre de sesión, datos de contacto y grupo familiar.
- Agenda con disponibilidad, reserva, cancelación y reprogramación; las transacciones impiden reservar dos veces el mismo horario.
- Documentos: certificado PDF de práctica, solicitudes de autorización, copia de orden e historia clínica; no se emiten órdenes ni aprobaciones desde la cuenta del usuario.
- Avisos persistentes y preferencias; correo SMTP opcional.
- PQRS con radicado, seguimiento y mensajes adicionales.

## Requisitos

- Node.js 24 y npm.
- MySQL 8.0 u 8.4 encendido, o Docker Desktop con Docker Compose.
- Descomprimir en una carpeta nueva y abrir **Virelia-EPS-Profesional** en VS Code.

## Instalación con Docker para MySQL

Desde la carpeta que contiene package.json:

```bash
npm ci
npm run setup
docker compose up -d --wait
npm run db:prepare
npm run db:init
npm run dev
```

`setup` genera un archivo `.env` local con claves aleatorias. `db:prepare` crea un usuario de aplicación y bases separadas para la aplicación y las pruebas. `db:init` crea las tablas y horarios de ejemplo sin borrar datos existentes. La aplicación se abre en **http://127.0.0.1:5173**. Ctrl+C detiene los cinco servicios, la entrada API y Vite; MySQL sigue encendido. `docker compose stop` detiene MySQL sin borrar el volumen.

## Si ya tienes MySQL instalado

1. Ejecuta `npm ci` y `npm run setup`.
2. Abre `.env`. Configura DB_HOST y DB_PORT según tu servidor. Escribe la contraseña de tu root local en MYSQL_ROOT_PASSWORD. Mantén DB_USER=virelia_app y la DB_PASSWORD generada para el nuevo usuario.
3. Ejecuta `npm run db:prepare`, `npm run db:init` y `npm run dev`.

No necesitas Docker si tu servidor MySQL ya funciona. MySQL Workbench es un cliente: el servicio MySQL Server también debe estar encendido. MariaDB no es el motor verificado en esta entrega.

Si reutilizas un usuario existente, su contraseña DB_PASSWORD debe coincidir con la configurada en MySQL: db:prepare no cambia contraseñas de cuentas que ya existen. Para usar un usuario con bases previamente creadas y permisos suficientes, puedes omitir db:prepare.

## Entrar al portal

Con SEED_DEMO=true, db:init crea esta cuenta local de prueba si aún no existe:

- Correo: **demo@virelia.test**
- Contraseña: **Virelia2026!**

Puedes crear otra cuenta con datos ficticios. Las sesiones se guardan en MySQL mediante un token en cookie HttpOnly y las contraseñas se almacenan derivadas con scrypt. No se guardan credenciales en localStorage.

El registro crea una afiliación simulada para poder explorar los recorridos; no realiza una afiliación oficial ni verifica cobertura real.

## Cinco microservicios

| Carpeta                 | Puerto local | Responsabilidad                         |
| ----------------------- | -----------: | --------------------------------------- |
| services/afiliados      |         3001 | Cuenta, sesión, perfil y grupo familiar |
| services/citas          |         3002 | Horarios y citas del usuario            |
| services/documentos     |         3003 | Documentos y solicitudes, PDF           |
| services/notificaciones |         3004 | Bandeja, preferencias y correo opcional |
| services/atencion       |         3005 | PQRS, radicado y mensajes               |

`gateway/` es una entrada HTTP delgada en el puerto 3000, no un sexto dominio. React usa `/api/<servicio>/...`; los procesos pueden arrancarse por separado con `npm start --workspace services/citas`, por ejemplo. `npm run dev` los inicia juntos para facilitar el trabajo local.

## MySQL

Una instancia con cinco bases: virelia_afiliados, virelia_citas, virelia_documentos, virelia_notificaciones y virelia_atencion. Cada servicio lee únicamente su propia base. Hay llaves foráneas dentro de cada dominio; los vínculos de usuario entre servicios se validan por API, no con llaves foráneas cruzadas. Consulta docs/REVISION_DEL_PDF.md y database/esquema.sql.

El archivo `.env` no forma parte del ZIP ni debe subirse a un repositorio. Los datos se conservan en MySQL entre reinicios. Esta versión no importa automáticamente registros de los prototipos anteriores en SQLite; nunca elimina la base anterior.

## Correo electrónico

La bandeja funciona sin SMTP. Para correo real, configura SMTP_HOST, SMTP_PORT, SMTP_SECURE y, si aplica, SMTP_USER/SMTP_PASSWORD y MAIL_FROM en `.env`, y reinicia los servicios. Sin SMTP, no se simula un envío: los avisos quedan en el portal. Los mensajes de correo solo invitan a consultar el portal, sin incluir detalles clínicos. No se han usado credenciales de un proveedor externo durante las pruebas.

## Pruebas

```bash
npm test
npm run test:integration
npx playwright install chromium
npm run test:e2e
npm run test:coverage
npm run build
```

Las pruebas de integración y navegador requieren MySQL y utilizan bases con sufijos \_integration y \_e2e, creadas con db:prepare. Deben estar libres los puertos 3000–3005, 4100–4105 y 5173. Detén npm run dev antes de probar. Los tests adaptados de BOGOBIKER están en frontend/src/**tests**/.

`npm run doctor` comprueba configuración y conexión sin mostrar contraseñas. `npm run build` genera frontend/dist. Para desplegar el build, se necesita servir `/api` hacia el gateway y configurar los orígenes y HTTPS del entorno. Esta entrega se verifica localmente.

## Alcance del prototipo

La agenda, las cuentas y los documentos están marcados como práctica. No hay integración con una EPS real, ADRES, agenda clínica externa ni firma digital. Las solicitudes documentales y PQRS quedan recibidas; la revisión clínica y respuesta institucional corresponden a un módulo de personal que no forma parte de este alcance orientado a usuarios.

El envío de eventos usa outbox transaccional y HTTP interno con reintentos e idempotencia. No exige instalar Kafka, RabbitMQ, Kubernetes ni servicios adicionales. Los envíos SMTP pueden repetirse si un proceso se interrumpe exactamente después de enviar y antes de registrar la confirmación: la bandeja sí evita duplicados por id de evento.

Los recorridos y la estructura están documentados en docs/ARQUITECTURA.md, docs/API.md y docs/PRUEBAS.md. La comparación con el PDF está en docs/REVISION_DEL_PDF.md.
