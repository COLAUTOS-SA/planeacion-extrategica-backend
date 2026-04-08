# Ejepro Backend

API backend de Planeación Estratégica (Node.js + Express + Prisma + MySQL).

## Stack
- Node.js (ESM)
- Express
- Prisma ORM
- MySQL
- JWT para autenticación
- Multer para carga de archivos

## Estructura Base
- `src/routes`: definición de endpoints
- `src/controllers`: validación/entrada HTTP
- `src/services`: lógica de negocio
- `src/models`: acceso a datos (Prisma)
- `prisma/schema.prisma`: modelos de base de datos

## Módulos Principales
- Auth (`/api/auth`)
- Usuarios (`/api/usuarios`)
- Resultados Claves (`/api/resultados`)
- Aprendizajes (`/api/aprendizajes`)
- Prioridades (`/api/prioridades`)
- Repositorio de Líderes (`/api/repositorio-lideres`)
- Plan Anual (`/api/plan-anual`)
- KPI dinámicos (`/api/kpis`)

---

## Autenticación y Roles
El token JWT incluye, entre otros:
- `id`
- `nombre`
- `email`
- `cargo`
- `area`
- `roles` (array)
- `rol` (compatibilidad)
- `sedes` (IDs de sedes asignadas)

Middleware:
- `authMiddleware`: valida token y carga `req.user`
- `authorizeRoles(...)`: permite acceso por roles

---

## Gestión de Usuarios y Sedes
Flujos activos:
- Crear usuario con roles y sedes (`POST /api/auth/register`)
- Editar usuario completo (`PATCH /api/usuarios/:id/full`)
- Consultar perfil (`GET /api/usuarios/me`)

Relaciones importantes:
- `usuarios_roles`: usuario <-> rol
- `usuario_sede`: usuario <-> sede

Esto permite que un líder/admin tenga 1 o múltiples sedes asignadas.

---

## Módulo KPI Dinámico
### Tablas base
- `kpi`
- `sede`
- `kpi_sede`
- `kpi_indicador`
- `kpi_indicador_campo` (columnas dinámicas por indicador)
- `kpi_valor` (registro por fecha/sede/indicador)
- `kpi_valor_campo` (valores dinámicos por campo)

### Reglas de visibilidad
- `admin/super_admin`: ven todos los KPI.
- `lider` (u otros no admin): solo ven KPI donde `id_responsable = req.user.id`.

### Reglas de edición
- `admin/super_admin`: edición total.
- líder creador/responsable: puede editar sus KPI.
- otros líderes: no pueden editar KPI ajenos.

### Endpoints KPI
Base: `/api/kpis`

- `GET /sedes`
- `GET /usuarios/:idUsuario/sedes`
- `PUT /usuarios/:idUsuario/sedes` (admin/super_admin)
- `GET /`
- `GET /:id`
- `POST /`
- `PATCH /:id`
- `DELETE /:id`
- `POST /valores`
- `PATCH /valores/:idValor`
- `DELETE /valores/:idValor` (soft delete)

### Payload de creación KPI (ejemplo)
```json
{
  "titulo": "KPI Contact Center 2026",
  "proceso": "Contact Center",
  "tipo": "regional",
  "plan_accion": "Seguimiento semanal",
  "sedes": [1, 2, 3],
  "indicadores": [
    {
      "nombre": "Citas efectivas por sede",
      "campos": [
        { "nombre": "Objetivo", "tipo": "numero" },
        { "nombre": "Citas efectivas", "tipo": "numero" },
        { "nombre": "% Cumplimiento", "tipo": "porcentaje", "es_calculado": true, "editable": false }
      ]
    }
  ]
}
```

### Payload de valor dinámico (ejemplo)
```json
{
  "id_indicador": 10,
  "id_sede": 2,
  "fecha": "2026-03-24",
  "campos": [
    { "id_campo": 101, "valor_decimal": 604 },
    { "id_campo": 102, "valor_decimal": 609 },
    { "id_campo": 103, "valor_decimal": 100.82 }
  ]
}
```

---

## Prisma y Deploy (VPS)
Después de subir cambios:

```bash
git pull
npm install
npx prisma generate
# si usas migraciones:
# npx prisma migrate deploy
pm2 restart <proceso>
pm2 logs <proceso> --lines 120
```

Si usas Docker:
```bash
docker compose build --no-cache
docker compose up -d
docker compose logs -f
```

---

## Notas Operativas
- Si Prisma falla con `@prisma/client did not initialize yet`, ejecutar `npx prisma generate`.
- Carga de avatar y evidencias usa CTERA (`ctera.service.js`).
- El endpoint de `register` hoy está abierto; en producción se recomienda protegerlo por rol admin/super_admin.
