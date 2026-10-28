# Verificación de la entrega

La suite se ejecuta sobre la interfaz, las APIs HTTP y MySQL real. No se sustituye MySQL por un arreglo en memoria para afirmar integración.

| Nivel                 | Casos | Qué comprueba                                                                                      |
| --------------------- | ----: | -------------------------------------------------------------------------------------------------- |
| Unitarios de servidor |    11 | Contraseñas derivadas, sesiones, validación y PDF con texto largo                                  |
| Componentes React     |    10 | Menú, estructura semántica, formulario y diferencias entre secciones                               |
| Integración con MySQL |    13 | Cinco procesos, cuenta propia, transacciones, documentos, PQRS, eventos, SMTP local y persistencia |
| Navegador             |     4 | Recorridos públicos y privados en escritorio y móvil                                               |

Resultado de la entrega: **38 pruebas aprobadas**, compilación correcta y auditoría npm con cero vulnerabilidades reportadas. Se comprobó desde una extracción nueva del ZIP, con usuario de aplicación y bases MySQL creados desde cero. Consulta el resultado real del comando: los tests no omiten silenciosamente MySQL ni transforman un fallo en una prueba aprobada.

## Pruebas relevantes

- La API rechaza el acceso personal sin una sesión y el gateway bloquea rutas internas.
- La contraseña no se devuelve ni se guarda en texto plano.
- Una cuenta no puede retirar un beneficiario, cancelar una cita, descargar un documento ni abrir un radicado ajeno.
- Dos reservas concurrentes sobre el mismo horario producen una confirmación y un conflicto 409.
- Reprogramar conserva la integridad del horario; cancelar vuelve a liberarlo.
- El archivo descargado es un PDF real; las solicitudes no se convierten en autorizaciones aprobadas.
- PQRS conserva radicado y mensajes.
- Un evento repetido genera un único aviso. SMTP se prueba contra un servidor local de recepción, sin enviar mensajes a personas externas.
- La sesión y los registros sobreviven al reinicio de los servicios.
- Los recorridos de navegador cubren registro, perfil, cita, descarga, radicado, avisos y cierre de sesión en escritorio y móvil.
- Las páginas públicas tienen herramientas distintas: lista de preparación, asistente, tabs de acompañamiento y preguntas filtrables.

## Comandos

```bash
npm test
npm run test:integration
npx playwright install chromium
npm run test:e2e
npm run test:coverage
npm run build
```

Para los tests con MySQL, se necesitan las bases de pruebas creadas con `npm run db:prepare`. Los datos se escriben solo en los esquemas con sufijos `_integration` y `_e2e`. Los procesos de prueba se arrancan y detienen automáticamente. Los datos de prueba quedan en esas bases separadas para inspección; no se borra la base principal.

Las tres categorías del ejemplo BOGOBIKER se conservan en `frontend/src/__tests__/`: navegación, formulario y estructura responsive. El test semántico no se presenta como prueba visual; los tamaños reales se comprueban en Playwright.

## Entorno y límites

Node.js 24.19.0, MySQL 8.0.46 y Chromium en Linux. Se revisan capturas internas de escritorio y móvil. No se afirma ejecución nativa en Windows ni prueba de Docker Desktop en este entorno; los scripts Node evitan comandos específicos de Bash para la instalación de la aplicación. La configuración Compose usa MySQL 8.4 y está incluida como alternativa de instalación.

El navegador de prueba se puede seleccionar mediante PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Se usa un Chromium disponible localmente cuando no se dispone de descarga desde el CDN de Playwright. Esta variable no es necesaria en una instalación estándar con `npx playwright install chromium`.

No se ejecutaron pruebas de carga ni una auditoría de seguridad de producción. El envío SMTP se validó localmente; un proveedor externo debe configurarse con sus propias credenciales.

## Cobertura

El reporte V8 incluye el código fuente completo del frontend; no integra la cobertura de los recorridos Playwright ni del backend. No se declara cobertura total. El porcentaje no reemplaza las verificaciones de acceso por titular, transacciones y SMTP de las pruebas de integración.
