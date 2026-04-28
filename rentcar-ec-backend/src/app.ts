import 'dotenv/config';
import { randomUUID } from 'crypto';
import path from 'path';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// ── Routers ───────────────────────────────────────────────────
import { createAuthRouter }           from './modules/auth/auth.routes.js';
import { createVehiculoRouter }       from './modules/vehiculos/vehiculo.routes.js';
import { createAgenciaRouter }        from './modules/agencias/agencia.routes.js';
import { createEmpresaRouter }        from './modules/empresas/empresa.routes.js';
import { createCatalogosRouter }      from './modules/catalogos/catalogos.routes.js';
import { createReservaRouter }        from './modules/reservas/reserva.routes.js';
import { createAlquilerRouter }       from './modules/alquileres/alquiler.routes.js';
import { createDevolucionRouter }     from './modules/devoluciones/devolucion.routes.js';
import { createPagoRouter }           from './modules/pagos/pago.routes.js';
import { createFacturaRouter }        from './modules/facturas/factura.routes.js';
import { createHistorialRouter }      from './modules/historial/historial.routes.js';
import { createKardexRouter }         from './modules/kardex/kardex.routes.js';
import { createOutboxRouter }         from './modules/outbox/outbox.routes.js';
import { createClienteRouter }        from './modules/clientes/cliente.routes.js';
import { createUsuarioRouter }        from './modules/usuarios/usuario.routes.js';
import { createMantenimientoRouter }  from './modules/mantenimientos/mantenimiento.routes.js';
import { errorHandler }               from './shared/errors/error.middleware.js';
import { swaggerSpec }                from './docs/swagger.js';

// ── DI Container ──────────────────────────────────────────────
import {
  authController,
  vehiculoController,
  reservaController,
  alquilerController,
  devolucionController,
  pagoController,
  facturaController,
  catalogosController,
  clienteController,
  usuarioController,
  mantenimientoController,
  agenciaRepo,
  empresaRepo,
  historialRepo,
  kardexRepo,
  outboxRepo,
} from './shared/container.js';

// ─────────────────────────────────────────────────────────────
const app = express();

// ── CORS ──────────────────────────────────────────────────────
const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : [];

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:4200',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  ...envOrigins,
].filter(Boolean) as string[];

const localhostRe = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
  origin(origin, cb) {
    if (!origin || localhostRe.test(origin) || allowedOrigins.includes(origin)) return cb(null, true);
    console.warn('⚠️  CORS bloqueado:', origin);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public', 'uploads')));

// ── Correlation ID ────────────────────────────────────────────
app.use((req, res, next) => {
  const cid = (req.headers['x-correlation-id'] as string) || randomUUID();
  req.headers['x-correlation-id'] = cid;
  res.setHeader('X-Correlation-Id', cid);
  next();
});

// ── Logger (solo desarrollo) ──────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      method: req.method,
      path: req.path,
      cid: req.headers['x-correlation-id'],
    }));
    next();
  });
}

// ── Health check ──────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    service: 'RentCar Ec — Sistema de Alquiler de Autos',
    version: '1.0.0',
    status: 'online',
    architecture: 'Modular (modules / shared)',
    apiVersion: 'v1',
    docs: '/api/v1/docs',
    endpoints: {
      auth:            '/api/v1/auth',
      vehiculos:       '/api/v1/vehiculos',
      agencias:        '/api/v1/agencias',
      empresas:        '/api/v1/empresas',
      reservas:        '/api/v1/reservas',
      alquileres:      '/api/v1/alquileres',
      devoluciones:    '/api/v1/devoluciones',
      pagos:           '/api/v1/pagos',
      facturas:        '/api/v1/facturas',
      clientes:        '/api/v1/clientes',
      usuarios:        '/api/v1/usuarios',
      mantenimientos:  '/api/v1/mantenimientos',
      historial:       '/api/v1/historial',
      kardex:          '/api/v1/kardex',
      outboxEvents:    '/api/v1/outbox-events',
      catalogos:       '/api/v1/catalogos',
    },
  });
});

// ── Rate limiting ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Demasiados intentos. Espera 15 minutos e intenta de nuevo.' } },
  skip: () => process.env.NODE_ENV === 'development',
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Demasiadas solicitudes. Espera un momento.' } },
  skip: () => process.env.NODE_ENV === 'development',
});

app.use('/api/v1', generalLimiter);
app.use('/api/v1/auth', authLimiter);

// ── Rutas principales ─────────────────────────────────────────
app.use('/api/v1/auth',           createAuthRouter(authController));
app.use('/api/v1/vehiculos',      createVehiculoRouter(vehiculoController));
app.use('/api/v1/agencias',       createAgenciaRouter(agenciaRepo));
app.use('/api/v1/empresas',       createEmpresaRouter(empresaRepo));
app.use('/api/v1/catalogos',      createCatalogosRouter(catalogosController));
app.use('/api/v1/reservas',       createReservaRouter(reservaController));
app.use('/api/v1/alquileres',     createAlquilerRouter(alquilerController));
app.use('/api/v1/devoluciones',   createDevolucionRouter(devolucionController));
app.use('/api/v1/pagos',          createPagoRouter(pagoController));
app.use('/api/v1/facturas',       createFacturaRouter(facturaController));
app.use('/api/v1/historial',      createHistorialRouter(historialRepo));
app.use('/api/v1/kardex',         createKardexRouter(kardexRepo));
app.use('/api/v1/outbox-events',  createOutboxRouter(outboxRepo));
app.use('/api/v1/clientes',       createClienteRouter(clienteController));
app.use('/api/v1/usuarios',       createUsuarioRouter(usuarioController));
app.use('/api/v1/mantenimientos', createMantenimientoRouter(mantenimientoController));

// ── Catálogos en raíz /api/v1 (aliases directos) ─────────────
app.use('/api/v1', createCatalogosRouter(catalogosController));

// ── Swagger UI (vía CDN) ──────────────────────────────────────
app.get('/api/v1/docs/spec', (_req, res) => res.json(swaggerSpec));
app.get('/api/v1/docs', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <title>RentCar Ec — API Docs v1</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fafafa; }
    </style>
</head>
<body>
  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/v1/docs/spec',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        layout: 'StandaloneLayout',
        deepLinking: true,
        tryItOutEnabled: true,
        persistAuthorization: true,
        displayRequestDuration: true,
        defaultModelsExpandDepth: -1,
        defaultModelExpandDepth: 2,
        filter: true,
        syntaxHighlight: { activated: true, theme: 'monokai' },
        requestSnippetsEnabled: true,
      });
    };
  </script>
</body>
</html>`);
});

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Ruta ${req.originalUrl} no encontrada` },
  });
});

// ── Error handler global ──────────────────────────────────────
app.use(errorHandler);

export default app;
