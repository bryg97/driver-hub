# Driver Hub

Crea una plataforma web de gestión de onboarding de conductores para empresas de transporte 

(cliente inicial: MX TAXI, México). El sistema debe poder reutilizarse para otros clientes, 

así que NO hardcodees el nombre de la empresa en ningún componente — usa un objeto de 

configuración centralizado (archivo config/company.ts) con: companyName, timezone 

("America/Mexico_City"), logoUrl, primaryColor, cities (array, ej: ["CDMX", "EDOMEX"]). 

Todos los textos de marca deben leer de ahí.

IMPORTANTE: NO configures base de datos, NO uses Supabase, NO uses autenticación de terceros. 

Usa datos de ejemplo (mock data) en archivos separados dentro de /src/data/ con TypeScript 

interfaces bien definidas, y estado local de React (useState/Context). La base de datos real 

se conectará después mediante una API externa.

Todas las fechas y horas deben mostrarse en zona horaria America/Mexico_City. Usa una función 

utilitaria centralizada para formatear fechas (no format inline repetido).

=== ESTRUCTURA DE DATOS (mock, con estas interfaces TypeScript) ===

Driver: id, curp, driverCallsign, name, surname, email, mobile, city, company, 

  bgcStatus, accountStatus, completedTrip (bool), dateLastTrip, firstSeenAt, 

  fechaRegistroReal, vehicle {make, model, plates, color, year}, 

  onboardingStage ("registrado" | "contactado" | "app_instalada" | "cuenta_validada" | 

  "primer_viaje" | "seguimiento_activo" | "rescate" | "baja"),

  assignedAgentId, tripsCompleted, tripsRejected

ContactLog: id, driverId, agentId, fecha, canal ("llamada" | "whatsapp" | "presencial" | "correo"),

  resultado ("contactado_exitoso" | "no_contesta" | "buzon_voz" | "numero_equivocado" | 

  "rechazo_seguir"), comentario (opcional)

Alert: id, driverId, tipo ("sin_abordar" | "rescate" | "riesgo_baja"), diasUmbral, 

  triggeredAt, status ("abierta" | "resuelta")

Agent: id, name, email, role ("admin" | "agente")

ChangeHistoryEntry: id, driverId, fieldName, oldValue, newValue, changedAt, source

=== PÁGINAS ===

1. LOGIN

   Email + contraseña, diseño limpio centrado, logo desde config.

2. DASHBOARD UBER/BGC (ruta /dashboard/uber)

   - Tarjetas: total conductores, % pendientes, % en revisión, % aprobados/activos, 

     % rechazados, % cancelados

   - Gráfico de barras: conductores por ciudad

   - Gráfico de embudo: estados BGC

   - Filtro por ciudad y compañía

3. DASHBOARD ONBOARDING (ruta /dashboard/onboarding)

   - Tarjetas: conductores en proceso activo, alertas abiertas (desglosadas por tipo), 

     tiempo promedio a primer viaje, % con 0 viajes tras activación

   - Embudo de etapas: registrado → contactado → app instalada → cuenta validada → primer viaje

     (mostrar % de caída en cada paso)

   - Tabla de alertas activas con botón para ver el conductor

   - Panel de configuración de umbrales de alerta (días editables por tipo de alerta)

4. DASHBOARD AGENTES (ruta /dashboard/agentes)

   - Tabla ranking de agentes: conductores asignados, alertas abiertas bajo su cargo, 

     contactos realizados por canal, % de contacto exitoso, % de conductores activados, 

     tiempo promedio a primer viaje, % de rescate exitoso

   - Filtro por rango de fechas

5. CONDUCTORES (ruta /conductores)

   - Tabla filtrable por ciudad, compañía, estado BGC, etapa de onboarding, agente asignado

   - Buscador por nombre/CURP/callsign

   - Clic en fila abre la "hoja de vida" (puede ser modal o página /conductores/:id) con tabs:

     a) Datos generales (personales, vehículo, CURP, contacto)

     b) Línea de tiempo de etapas de onboarding (visual tipo stepper)

     c) Historial de contacto (lista de ContactLog, con formulario para agregar nuevo: 

        fecha, canal, resultado homologado en dropdown, comentario libre opcional)

     d) Historial de cambios (ChangeHistoryEntry, mostrando origen: sync_uber o agente)

     e) Alertas asociadas a este conductor

6. ADMIN (ruta /admin, solo visible para rol admin)

   - CRUD de usuarios: tabla con nombre, email, rol, botones editar/eliminar/resetear contraseña

   - Formulario para crear nuevo usuario

=== DISEÑO ===

Sidebar de navegación fijo a la izquierda con: Dashboard Uber, Dashboard Onboarding, 

Dashboard Agentes, Conductores, Admin (solo si rol admin). Header con nombre de usuario 

y botón de logout. Tema claro, profesional, usa componentes shadcn/ui, tipografía limpia, 

tarjetas con bordes sutiles, badges de color para estados (verde=aprobado, amarillo=pendiente, 

naranja=revisión, rojo=rechazado, gris=cancelado).

Genera datos mock realistas: al menos 40 conductores repartidos entre CDMX y EDOMEX, 

con variedad de estados y etapas, 3-4 agentes, y algunas alertas ya disparadas para 

que los dashboards se vean con datos reales al abrir la app.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/50ab213f-ce65-4b59-8b30-b459131b4b91).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
