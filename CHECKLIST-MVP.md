# Nómina Jarudo — Checklist MVP

Marca cada ítem al terminarlo / validarlo.  
Convención: `[x]` hecho · `[ ]` pendiente · `[-]` fuera de alcance o diferido.

---

## Infraestructura

- [x] Monorepo pnpm (`apps/web` SvelteKit + `apps/api` Express)
- [x] MongoDB Atlas con DB `nomina_jarudo` (URI en `.env`)
- [x] `.env.example` con `MONGODB_URI` / puertos dedicados
- [x] Puertos fijos sin matar otros procesos (`PORT=3088`, `WEB_PORT=5288`)
- [x] Node ≥ 24.22.1 (mitigación vulnerabilidades oct 2026)
- [x] Seed inicial (planta, operadores, config, PDF demo)

---

## Jefe de planta

- [x] Cargar uno o varios PDF SAP (selección / arrastre)
- [x] Validar formato PDF e informar errores
- [x] Evitar reportes duplicados (planta + fecha + nombre)
- [x] Estados de carga: pendiente / procesando / procesado / con_errores / error
- [x] Consultar tiquetes extraídos (fecha, tiquete, operador, vehículo, volumen, estado, origen)
- [x] Búsqueda / filtrado de tiquetes
- [x] Ver tiquetes excluidos con motivo (cancelado, consumo interno, duplicado)
- [x] Listar inconsistencias (faltantes, duplicados, etc.)
- [x] Calcular matriz / liquidación semanal
- [x] Ver detalle de viajes base, adicionales, tarifa y total
- [x] Confirmar / validar matriz semanal
- [x] Exportar matriz validada (CSV)
- [x] Historial de cargas con filtros (fecha, estado, archivo)

---

## Administrador de tarifas y reglas

- [x] Crear / consultar tarifas de viajes adicionales
- [x] Configurar bases (días laborales y sábado)
- [x] Criterios de depuración (cancelados + volumen consumo interno)
- [x] Vigencias (desde / hasta) sin solapes al publicar
- [x] Validar antes de publicar (campos, ≥ 0, vigencias)
- [x] Publicar configuración pendiente
- [x] Simular impacto sin persistir liquidación
- [x] Historial de cambios de configuración

---

## Operador de revolvedora

- [x] Resumen semanal (viajes, base, adicionales, total, estado)
- [x] Detalle de tiquetes incluidos / excluidos con motivo
- [x] Autenticación local de operador (login + JWT; sin Google/correo)

---

## Motor de procesamiento y liquidación

- [x] Procesar PDF y registrar resultado por archivo
- [x] Extraer tiquetes (fecha, operador, vehículo, volumen, estado, número)
- [x] Detectar duplicados
- [x] Excluir cancelados
- [x] Excluir consumo interno (default 0.5 m³)
- [x] Aplicar base 3 (semana) / 2 (sábado) por operador y jornada
- [x] Calcular adicionales × tarifa vigente
- [x] Consolidar liquidación semanal por operador
- [x] Guardar versión/config usada en liquidación
- [x] Trazabilidad de cálculos
- [x] Generar matriz + export CSV
- [x] Parser multi-formato SAP (pipe/tab/; + encabezados ES + fechas DD.MM.YYYY / líneas sueltas)

---

## Modelos Mongo (colecciones)

- [x] plantas
- [x] operadores
- [x] cargas
- [x] tiquetes
- [x] exclusiones
- [x] inconsistencias
- [x] resultadosExtraccion
- [x] configuraciones
- [x] configChanges
- [x] liquidaciones
- [x] matrices
- [x] viajesLiquidables
- [x] trazabilidad
- [x] usuarios

---

## Fuera de alcance (no MVP)

- [-] Auth con Google / OAuth
- [-] Envío de correo (notificaciones, recuperación, etc.)
- [-] App móvil nativa
- [-] RBAC completo en todas las rutas (solo detalle de operador restringido)
- [-] Export XLSX nativo (CSV sí; Excel avanzado no)
- [-] Integración directa API SAP (solo carga de PDF)
- [-] Multi-empresa / multi-tenant
- [-] Pagos / dispersión bancaria
- [-] Firma electrónica de matriz
- [-] Features no listadas en `nomina-jarudo-spec-mvp.md`

---

## Pendientes de endurecimiento (post-MVP o siguientes sprints)

- [ ] Probar con PDF SAP real del cliente y ajustar extractor (si el layout difiere)
- [x] Auth mínima por rol (login local + JWT_SECRET; sin Google)
- [x] Tests automatizados de liquidación / parser (`pnpm test`)
- [x] Pruebas funcionales Playwright (`pnpm test:e2e`)
- [x] Monorepo listo para un solo Vercel (`apps/web` + `/api` serverless) — ver `DEPLOY-VERCEL.md`
- [ ] Deploy en Vercel vía GitHub (`MONGODB_URI` + `JWT_SECRET`; `PUBLIC_API_URL` vacío)

---

_Última actualización: 2 nov 2026, 20:56 (México)._
