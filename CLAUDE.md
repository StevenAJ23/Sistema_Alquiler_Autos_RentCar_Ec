Actúa como un Arquitecto de Software Senior especializado en reingeniería de sistemas, API-first, Node.js, Express, TypeScript, Prisma, PostgreSQL y Angular.

Te he subido un proyecto existente de sistema de vuelos. Necesito que lo reestructures para convertirlo en un sistema de alquiler de autos, respetando al máximo la arquitectura original del sistema de vuelos.

IMPORTANTE:
No quiero que rompas la estructura del proyecto.
No quiero una reescritura desde cero.
Quiero una adaptación por reingeniería, manteniendo el mismo estilo de carpetas, módulos, servicios, repositorios, controladores, rutas, DTOs, entidades, mappers, middlewares, Swagger, Prisma y frontend Angular.

También te he subido:
1. Un PDF con la base oficial del sistema de alquiler de autos.
2. Un documento MD con el paquete final de implementación del Reto 1.

Tu tarea es implementar la transformación completa del sistema de vuelos hacia alquiler de autos, siguiendo estos criterios:

==================================================
1. OBJETIVO GENERAL
==================================================

Convertir el sistema actual de vuelos en una primera versión funcional de un sistema de alquiler de autos para el Reto 1: Construcción base API-first sin integración.

El sistema final debe cumplir con:

- Backend funcional con APIs REST documentadas.
- Frontend marketplace funcional.
- Sistema de administración funcional.
- Base de datos PostgreSQL operativa.
- Arquitectura monolítica modular preparada para futura integración.
- Versionamiento de API con /api/v1.
- Documentación Swagger.
- Preparación conceptual para gRPC, GraphQL, SOA, mensajería y EDA.
- Despliegue público posible en Render, Azure, Vercel, Netlify o similares.

==================================================
2. CONDICIÓN PRINCIPAL DE ARQUITECTURA
==================================================

Mantén la estructura original del sistema de vuelos.

Si el sistema actual tiene módulos como:

- controllers
- services
- repositories
- interfaces
- dtos
- entities
- mappers
- queries
- routes

Debes conservar ese patrón.

Ejemplo de transformación esperada:

api_flights        → api_reservas / api_disponibilidad
api_aircrafts     → api_vehiculos
api_airports      → api_agencias
api_airlines      → api_empresas
api_reservations  → api_reservas
api_payments      → api_pagos
api_invoices      → api_facturas
api_promotions    → api_promociones
api_users         → api_usuarios / api_clientes

No elimines patrones existentes si pueden reutilizarse.
No cambies Express por otro framework.
No cambies Angular por React.
No cambies Prisma por otro ORM.
No cambies PostgreSQL.

==================================================
3. BASE DE DATOS
==================================================

Usa como referencia principal la base oficial del PDF de alquiler de autos.

Debes adaptar el schema de Prisma para representar estas entidades principales:

- provincias
- ciudades
- empresas
- agencias
- marcas
- modelos
- categorias
- tipos_combustible
- estados_vehiculo
- tipos_transmision
- extras_equipamiento
- vehiculos
- usuarios
- clientes
- roles_permisos
- usuario_roles
- canales_venta
- sistemas_externos
- tarifas
- seguros
- reservas
- reserva_extras
- alquileres
- devoluciones
- pagos
- facturas
- detalle_factura
- historial_usuarios
- kardex
- mantenimientos
- outbox_events

IMPORTANTE:
La base del PDF está pensada para Supabase porque usa auth.users, RLS y auth.uid().
Pero el sistema de vuelos usa autenticación propia con JWT y bcrypt.
Por eso debes adaptar la tabla usuarios para autenticación propia del backend, agregando:

- Usu_Password_Hash
- Usu_Activo
- Usu_Updated_At

No uses auth.users de Supabase como dependencia obligatoria.

Mantén:
- UUID como identificadores.
- PostgreSQL.
- Prisma.
- Restricciones de integridad.
- Soft delete cuando aplique.
- Campos created_at y updated_at cuando aplique.

También debes crear una migración SQL complementaria para:

- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
- CREATE EXTENSION IF NOT EXISTS btree_gist;
- restricción anti-solapamiento de reservas con EXCLUDE USING gist;
- funciones/triggers necesarios si Prisma no los soporta directamente.

La regla crítica de reservas es:

Un mismo vehículo no puede tener dos reservas activas, pendientes o confirmadas con rangos de fechas solapados.

Estados cancelados no deben bloquear disponibilidad.

==================================================
4. LÓGICA DE NEGOCIO
==================================================

Reemplaza la lógica de vuelos por lógica de alquiler de autos.

Antes:
- vuelos
- aeropuertos
- aerolíneas
- aviones
- clases de vuelo
- pasajeros
- boarding pass
- disponibilidad de asientos

Ahora:
- vehículos
- agencias
- empresas de alquiler
- categorías de vehículo
- clientes/conductores
- reservas
- alquileres
- devoluciones
- pagos
- facturas
- extras
- seguros
- disponibilidad por rango de fechas

Implementa o adapta servicios para:

A. Disponibilidad de vehículos
- Buscar vehículos disponibles por agencia, categoría, transmisión, combustible, fecha inicio y fecha fin.
- Validar que no exista cruce de fechas.
- Excluir vehículos inactivos, eliminados o en mantenimiento.
- Excluir reservas canceladas.

B. Cálculo de precio
- Calcular número de días.
- Multiplicar precio diario del vehículo por días.
- Sumar extras por día.
- Sumar seguro por día si aplica.
- Aplicar tarifa base si corresponde.
- Calcular total de reserva.
- El backend siempre debe recalcular el total, nunca confiar en el precio enviado desde frontend.

C. Reservas
- Crear reserva.
- Consultar reservas propias del cliente.
- Consultar reserva por ID.
- Cancelar reserva.
- Actualizar estado.
- Validar disponibilidad antes de crear.
- Registrar evento en outbox_events cuando se cree una reserva.

D. Alquileres
- Iniciar alquiler desde una reserva confirmada.
- Registrar kilometraje de salida.
- Cambiar estado del vehículo a "En uso".

E. Devoluciones
- Registrar devolución.
- Validar kilometraje de entrada.
- Calcular cargo extra si aplica.
- Cambiar alquiler a finalizado.
- Cambiar reserva a completada.
- Cambiar vehículo a disponible.

F. Pagos y facturas
- Crear pago.
- Validar que el pago cubra el total de la reserva.
- Cambiar estado de pago.
- Generar factura.
- Generar detalle de factura.

G. Auditoría y eventos
- Registrar acciones críticas en historial_usuarios.
- Registrar cambios de estado del vehículo en kardex.
- Crear eventos de negocio en outbox_events.

Eventos mínimos:
- RESERVA_CREADA
- RESERVA_CANCELADA
- PAGO_REGISTRADO
- ALQUILER_INICIADO
- VEHICULO_DEVUELTO
- FACTURA_GENERADA

==================================================
5. API REST Y SWAGGER
==================================================

Mantén versionamiento:

/api/v1

Diseña o adapta rutas REST como mínimo:

Autenticación:
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me

Vehículos:
GET    /api/v1/vehiculos
GET    /api/v1/vehiculos/marketplace
GET    /api/v1/vehiculos/search
GET    /api/v1/vehiculos/:id
POST   /api/v1/vehiculos
PATCH  /api/v1/vehiculos/:id
DELETE /api/v1/vehiculos/:id

Agencias:
GET    /api/v1/agencias
GET    /api/v1/agencias/:id
POST   /api/v1/agencias
PATCH  /api/v1/agencias/:id
DELETE /api/v1/agencias/:id

Empresas:
GET    /api/v1/empresas
GET    /api/v1/empresas/:id
POST   /api/v1/empresas
PATCH  /api/v1/empresas/:id
DELETE /api/v1/empresas/:id

Catálogos:
GET /api/v1/marcas
GET /api/v1/modelos
GET /api/v1/categorias
GET /api/v1/tipos-combustible
GET /api/v1/tipos-transmision
GET /api/v1/estados-vehiculo
GET /api/v1/extras
GET /api/v1/seguros
GET /api/v1/tarifas
GET /api/v1/canales-venta

Reservas:
GET    /api/v1/reservas
GET    /api/v1/reservas/my
GET    /api/v1/reservas/:id
POST   /api/v1/reservas
PATCH  /api/v1/reservas/:id
PATCH  /api/v1/reservas/:id/cancel

Alquileres:
POST   /api/v1/alquileres
GET    /api/v1/alquileres
GET    /api/v1/alquileres/:id

Devoluciones:
POST   /api/v1/devoluciones
GET    /api/v1/devoluciones
GET    /api/v1/devoluciones/:id

Pagos:
POST   /api/v1/pagos
GET    /api/v1/pagos
GET    /api/v1/pagos/:id

Facturas:
POST   /api/v1/facturas
GET    /api/v1/facturas
GET    /api/v1/facturas/:id

Auditoría:
GET /api/v1/historial
GET /api/v1/kardex
GET /api/v1/outbox-events

Cada endpoint debe tener:
- DTO de entrada.
- Validación con Zod si el proyecto ya la usa.
- Respuestas JSON consistentes.
- Códigos HTTP correctos.
- Documentación Swagger.

==================================================
6. FRONTEND ANGULAR
==================================================

Mantén Angular y la estructura existente.

Transforma las vistas de vuelos a alquiler de autos.

Marketplace público:
- Página principal con búsqueda de autos.
- Filtros por ciudad/agencia, categoría, transmisión, combustible y fechas.
- Listado de vehículos disponibles.
- Detalle del vehículo.
- Formulario de reserva.
- Selección de extras y seguro.
- Confirmación de reserva.

Cliente:
- Login.
- Registro.
- Perfil.
- Mis reservas.
- Detalle de reserva.
- Cancelar reserva.
- Ver estado de pago.

Administración:
- Dashboard.
- Gestión de vehículos.
- Gestión de agencias.
- Gestión de empresas.
- Gestión de marcas/modelos/categorías.
- Gestión de reservas.
- Gestión de alquileres.
- Gestión de devoluciones.
- Gestión de pagos.
- Gestión de facturas.
- Kardex.
- Historial.

Adapta los servicios Angular:

flights.service.ts       → vehiculos.service.ts / disponibilidad.service.ts
reservations.service.ts → reservas.service.ts
airports.service.ts     → agencias.service.ts
airlines.service.ts     → empresas.service.ts
aircrafts.service.ts    → vehiculos-admin.service.ts
payments.service.ts     → pagos.service.ts
invoices.service.ts     → facturas.service.ts

Centraliza la URL base en environment:

environment.apiUrl = '/api/v1' o la URL pública del backend.

No dejes URLs quemadas en componentes.

==================================================
7. ROLES Y SEGURIDAD
==================================================

Mantén JWT y bcrypt como en el sistema original.

Roles mínimos:
- admin
- cliente

Reglas:
- Marketplace público puede ver vehículos activos.
- Cliente autenticado puede crear reservas.
- Cliente solo ve sus propias reservas.
- Admin puede gestionar todo.
- Solo admin puede ver historial, kardex y outbox_events.
- Admin puede crear, editar y eliminar vehículos.
- Cliente no puede modificar precios ni estado interno de vehículos.

Implementa middlewares:
- authenticate
- authorizeAdmin
- validateRequest

==================================================
8. PREPARACIÓN API-FIRST E INTEGRACIÓN FUTURA
==================================================

El Reto 1 aún no exige integración real con Booking Prototipo, pero el sistema debe quedar listo.

Incluye en la documentación y/o comentarios técnicos:

A. Contratos API
- Endpoints documentados.
- Swagger actualizado.
- Versionamiento /api/v1.
- Esquemas de request/response.

B. Futuro Booking Prototipo
Identifica endpoints que Booking usaría:
- GET /api/v1/vehiculos/search
- GET /api/v1/vehiculos/:id
- POST /api/v1/reservas
- GET /api/v1/reservas/:id
- PATCH /api/v1/reservas/:id/cancel
- POST /api/v1/pagos

C. Eventos futuros
Modela outbox_events para integración futura:
- reserva creada
- reserva cancelada
- pago registrado
- vehículo devuelto
- factura generada

D. Sistemas externos
Usa la tabla sistemas_externos para preparar integraciones futuras:
- Booking Prototipo
- apps móviles
- canales externos

E. Correlation ID
Mantén Res_Correlation_ID para trazabilidad entre sistemas.

==================================================
9. gRPC, GRAPHQL, SOA Y EDA
==================================================

No es obligatorio implementar gRPC ni GraphQL en este reto, pero sí dejar propuesta técnica.

Incluye en la documentación:

gRPC futuro:
- AvailabilityService
- PricingService
- ReservationService
- PaymentService

GraphQL futuro:
- Consulta agregada para marketplace:
  vehículo + agencia + empresa + categoría + disponibilidad + precio + extras.

SOA:
- Separar en el futuro:
  Servicio de Vehículos
  Servicio de Reservas
  Servicio de Pagos
  Servicio de Facturación
  Servicio de Notificaciones

EDA:
- Usar outbox_events como preparación para eventos.
- En el futuro publicar eventos en RabbitMQ, Kafka, Azure Service Bus o similar.

==================================================
10. SEED Y DATOS DE PRUEBA
==================================================

Crea o adapta seed.ts para incluir:

- Provincias: Pichincha, Guayas, Azuay.
- Ciudades: Quito, Guayaquil, Cuenca.
- Empresas: RentCar Ecuador, AutoFast.
- Agencias: Quito Norte, Guayaquil Centro, Cuenca Centro.
- Marcas: Toyota, Chevrolet, Kia, Hyundai.
- Modelos: Corolla, D-Max, Sportage, Tucson, Picanto.
- Categorías: Económico, Sedán, SUV, Pickup.
- Combustibles: Gasolina, Diésel, Híbrido, Eléctrico.
- Transmisión: Manual, Automático.
- Estados: Disponible, Reservado, En uso, Mantenimiento.
- Extras: GPS, Silla de bebé, Seguro premium, WiFi portátil.
- Seguros: Básico, Completo, Premium.
- Tarifas: Estándar, Fin de semana, Corporativa.
- Canales: Web, App móvil, Mostrador.
- Usuario admin.
- Cliente de prueba.
- Vehículos de prueba.
- Reserva de prueba si es seguro crearla.

==================================================
11. DESPLIEGUE
==================================================

Mantén o adapta configuración existente para despliegue.

Debe quedar listo para:
- Backend en Render, Azure Web App o similar.
- Frontend en Azure Static Web Apps, Netlify, Vercel o similar.
- PostgreSQL en Supabase, Neon, Render PostgreSQL o Azure Database.

Variables de entorno mínimas:

DATABASE_URL=
JWT_SECRET=
PORT=
CORS_ORIGIN=
NODE_ENV=

No dejes secretos reales en el repositorio.

==================================================
12. ENTREGA FINAL ESPERADA
==================================================

Necesito que al final me entregues:

1. Lista de archivos modificados.
2. Lista de archivos nuevos.
3. Explicación de cómo se transformó cada módulo del sistema de vuelos.
4. Pasos para instalar dependencias.
5. Pasos para ejecutar migraciones.
6. Pasos para ejecutar seed.
7. Pasos para levantar backend.
8. Pasos para levantar frontend.
9. Endpoints principales.
10. Qué partes quedaron listas para el Reto 1.
11. Qué partes quedan preparadas para el Reto 2 de integración.

==================================================
13. REGLAS IMPORTANTES
==================================================

No elimines la estructura original del proyecto si se puede adaptar.
No hagas una reescritura completa desde cero.
No cambies el stack principal.
No quites Swagger.
No quites Prisma.
No quites Angular.
No dejes código muerto de vuelos visible en nombres de rutas, pantallas o variables principales.
No rompas autenticación.
No confíes en precios enviados desde frontend.
No permitas reservas solapadas del mismo vehículo.
No permitas que clientes vean reservas de otros clientes.
No permitas que clientes administren vehículos.
No uses Supabase Auth como dependencia obligatoria.
Adapta la base Supabase-like a JWT propio del sistema original.

Empieza revisando la estructura del proyecto y luego implementa la reingeniería por capas:
1. Prisma/schema.
2. Migración SQL complementaria.
3. Seed.
4. Módulos backend.
5. Swagger.
6. Frontend Angular.
7. Documentación final.