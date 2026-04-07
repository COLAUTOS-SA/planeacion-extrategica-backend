import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError.js";

const isAdminLike = (roles) =>
  roles.includes("admin") || roles.includes("super_admin") || roles.includes("2");

const normalizeRoles = (user) => {
  if (!user) return [];
  const roles = [];
  if (Array.isArray(user.roles)) roles.push(...user.roles);
  if (user.rol) roles.push(user.rol);
  return roles.map((role) => String(role).toLowerCase());
};

const canManageUserSedes = (roles) =>
  roles.includes("admin") || roles.includes("super_admin") || roles.includes("2");

const parseDateOnly = (date) => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError("Fecha inválida. Usa formato YYYY-MM-DD", 400);
  }
  return parsed;
};

const parseDecimal = (value, fieldName) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new AppError(`El campo ${fieldName} debe ser numérico`, 400);
  }
  return new Prisma.Decimal(num);
};

export class KpiService {
  constructor(model) {
    this.model = model;
  }

  assertKpiEditableByUser(kpi, user) {
    const roles = normalizeRoles(user);
    if (isAdminLike(roles)) return;

    if (roles.includes("lider") && kpi.id_responsable === user.id) return;

    throw new AppError("No autorizado", 403);
  }

  normalizeSedes(sedes = []) {
    if (!Array.isArray(sedes)) {
      throw new AppError("El campo sedes debe ser un arreglo", 400);
    }
    return [...new Set(sedes.map((id) => Number(id)).filter((id) => Number.isInteger(id)))];
  }

  normalizeIndicadores(indicadores = []) {
    if (!Array.isArray(indicadores)) {
      throw new AppError("El campo indicadores debe ser un arreglo", 400);
    }

    const parsed = indicadores
      .map((item) => (typeof item === "string" ? item : item?.nombre || ""))
      .map((name) => name.trim())
      .filter(Boolean);

    return [...new Set(parsed)];
  }

  async getAllowedSedeIds(user) {
    const roles = normalizeRoles(user);
    if (isAdminLike(roles)) return null;

    const rows = await this.model.findUserSedes(user.id);
    return rows.map((row) => row.id_sede);
  }

  filterKpiByAllowedSedes(kpi, allowedSedeIds) {
    if (!Array.isArray(allowedSedeIds)) return kpi;

    const allowed = new Set(allowedSedeIds);

    const filteredSedes = (kpi.kpi_sede || []).filter((item) =>
      allowed.has(item.id_sede),
    );

    const filteredIndicadores = (kpi.kpi_indicador || []).map((indicador) => ({
      ...indicador,
      kpi_valor: (indicador.kpi_valor || []).filter(
        (valor) => valor.id_sede === null || allowed.has(valor.id_sede),
      ),
    }));

    return {
      ...kpi,
      kpi_sede: filteredSedes,
      kpi_indicador: filteredIndicadores,
    };
  }

  async getUsuarioSedes(idUsuarioRequest, user) {
    const roles = normalizeRoles(user);
    if (!canManageUserSedes(roles) && user.id !== idUsuarioRequest) {
      throw new AppError("No autorizado", 403);
    }

    return this.model.findUserSedes(idUsuarioRequest);
  }

  async updateUsuarioSedes(idUsuarioRequest, sedes, user) {
    const roles = normalizeRoles(user);
    if (!canManageUserSedes(roles)) {
      throw new AppError("No autorizado", 403);
    }

    const parsedSedes = this.normalizeSedes(sedes);
    if (!parsedSedes.length) {
      throw new AppError("Debes asignar al menos una sede", 400);
    }

    await this.model.replaceUserSedes(idUsuarioRequest, parsedSedes);
    return this.model.findUserSedes(idUsuarioRequest);
  }

  async getSedes() {
    return this.model.findSedes();
  }

  async getAll(user) {
    const roles = normalizeRoles(user);
    const where = {};
    const allowedSedeIds = await this.getAllowedSedeIds(user);

    if (roles.includes("lider") && !isAdminLike(roles)) {
      where.id_responsable = user.id;
    }

    const rows = await this.model.findAll(where);
    const filtered = rows
      .map((row) => this.filterKpiByAllowedSedes(row, allowedSedeIds))
      .filter((row) => !Array.isArray(allowedSedeIds) || row.kpi_sede.length > 0);

    return filtered;
  }

  async getById(idKpi, user) {
    const kpi = await this.model.findById(idKpi);
    if (!kpi) {
      throw new AppError("KPI no encontrado", 404);
    }

    this.assertKpiEditableByUser(kpi, user);
    const allowedSedeIds = await this.getAllowedSedeIds(user);
    const filtered = this.filterKpiByAllowedSedes(kpi, allowedSedeIds);

    if (Array.isArray(allowedSedeIds) && filtered.kpi_sede.length === 0) {
      throw new AppError("No autorizado para consultar este KPI", 403);
    }

    return filtered;
  }

  async create(payload, user) {
    const roles = normalizeRoles(user);
    const sedes = this.normalizeSedes(payload.sedes);
    const indicadores = this.normalizeIndicadores(payload.indicadores);

    if (!payload.titulo?.trim()) {
      throw new AppError("El título es obligatorio", 400);
    }

    if (!indicadores.length) {
      throw new AppError("Debes enviar al menos un indicador", 400);
    }

    if (!sedes.length) {
      throw new AppError("Debes asignar al menos una sede", 400);
    }

    let idResponsable = Number(payload.id_responsable);
    if (!Number.isInteger(idResponsable)) {
      idResponsable = user.id;
    }

    if (!isAdminLike(roles) && idResponsable !== user.id) {
      throw new AppError("No autorizado para asignar otro responsable", 403);
    }

    if (!isAdminLike(roles)) {
      const allowedSedeIds = await this.getAllowedSedeIds(user);
      const allowed = new Set(allowedSedeIds || []);
      const invalid = sedes.filter((idSede) => !allowed.has(idSede));
      if (invalid.length) {
        throw new AppError("Hay sedes no permitidas para el usuario", 403);
      }
    }

    const created = await this.model.create({
      titulo: payload.titulo.trim(),
      proceso: payload.proceso?.trim() || null,
      plan_accion: payload.plan_accion?.trim() || null,
      tipo: payload.tipo || "individual",
      id_responsable: idResponsable,
      id_objetivo_general: payload.id_objetivo_general || null,
      meta: parseDecimal(payload.meta, "meta") ?? new Prisma.Decimal(0),
      valor_actual:
        parseDecimal(payload.valor_actual, "valor_actual") ?? new Prisma.Decimal(0),
    });

    await this.model.replaceKpiSedes(created.id_kpi, sedes);
    await this.model.replaceIndicadores(created.id_kpi, indicadores);

    return this.model.findById(created.id_kpi);
  }

  async update(idKpi, payload, user) {
    const kpi = await this.model.findById(idKpi);
    if (!kpi) {
      throw new AppError("KPI no encontrado", 404);
    }

    this.assertKpiEditableByUser(kpi, user);

    const data = {};
    if (payload.titulo !== undefined) data.titulo = payload.titulo?.trim();
    if (payload.proceso !== undefined) data.proceso = payload.proceso?.trim() || null;
    if (payload.plan_accion !== undefined) {
      data.plan_accion = payload.plan_accion?.trim() || null;
    }
    if (payload.tipo !== undefined) data.tipo = payload.tipo;
    if (payload.id_objetivo_general !== undefined) {
      data.id_objetivo_general = payload.id_objetivo_general || null;
    }
    if (payload.meta !== undefined) data.meta = parseDecimal(payload.meta, "meta");
    if (payload.valor_actual !== undefined) {
      data.valor_actual = parseDecimal(payload.valor_actual, "valor_actual");
    }

    if (Object.keys(data).length) {
      await this.model.update(idKpi, data);
    }

    if (payload.sedes !== undefined) {
      const sedes = this.normalizeSedes(payload.sedes);
      if (!sedes.length) {
        throw new AppError("Debes asignar al menos una sede", 400);
      }

      const roles = normalizeRoles(user);
      if (!isAdminLike(roles)) {
        const allowedSedeIds = await this.getAllowedSedeIds(user);
        const allowed = new Set(allowedSedeIds || []);
        const invalid = sedes.filter((idSede) => !allowed.has(idSede));
        if (invalid.length) {
          throw new AppError("Hay sedes no permitidas para el usuario", 403);
        }
      }

      await this.model.replaceKpiSedes(idKpi, sedes);
    }

    if (payload.indicadores !== undefined) {
      const indicadores = this.normalizeIndicadores(payload.indicadores);
      if (!indicadores.length) {
        throw new AppError("Debes enviar al menos un indicador", 400);
      }
      try {
        await this.model.replaceIndicadores(idKpi, indicadores);
      } catch (error) {
        if (error?.code === "P2003") {
          throw new AppError(
            "No se pueden reemplazar indicadores porque ya tienen valores registrados",
            409,
          );
        }
        throw error;
      }
    }

    return this.model.findById(idKpi);
  }

  async delete(idKpi, user) {
    const kpi = await this.model.findById(idKpi);
    if (!kpi) {
      throw new AppError("KPI no encontrado", 404);
    }

    this.assertKpiEditableByUser(kpi, user);

    try {
      return await this.model.delete(idKpi);
    } catch (error) {
      if (error?.code === "P2003") {
        throw new AppError(
          "No se puede eliminar el KPI porque tiene valores relacionados",
          409,
        );
      }
      throw error;
    }
  }

  async saveValores(payload, user) {
    const fecha = parseDateOnly(payload.fecha);
    if (!Array.isArray(payload.valores) || !payload.valores.length) {
      throw new AppError("Debes enviar al menos un valor", 400);
    }

    const roles = normalizeRoles(user);
    const allowedSedeIds = await this.getAllowedSedeIds(user);
    const saved = [];

    for (const item of payload.valores) {
      const idIndicador = Number(item.id_indicador);
      if (!Number.isInteger(idIndicador)) {
        throw new AppError("id_indicador inválido", 400);
      }

      const indicador = await this.model.findIndicadorById(idIndicador);
      if (!indicador) {
        throw new AppError(`Indicador no encontrado: ${idIndicador}`, 404);
      }

      this.assertKpiEditableByUser(indicador.kpi, user);

      const idSede =
        item.id_sede === null || item.id_sede === undefined
          ? null
          : Number(item.id_sede);
      if (idSede !== null && !Number.isInteger(idSede)) {
        throw new AppError("id_sede inválido", 400);
      }

      if (idSede !== null) {
        const enabled = indicador.kpi.kpi_sede.some((x) => x.id_sede === idSede);
        if (!enabled) {
          throw new AppError(
            `La sede ${idSede} no está asociada al KPI ${indicador.kpi.id_kpi}`,
            400,
          );
        }
      }

      if (!isAdminLike(roles) && idSede !== null) {
        const allowed = new Set(allowedSedeIds || []);
        if (!allowed.has(idSede)) {
          throw new AppError("No autorizado para registrar valores en esta sede", 403);
        }
      }

      const data = {
        id_indicador: idIndicador,
        id_sede: idSede,
        fecha,
        objetivo: parseDecimal(item.objetivo, "objetivo"),
        resultado: parseDecimal(item.resultado, "resultado"),
      };

      const existing = await this.model.findValorByUniqueTuple(
        idIndicador,
        fecha,
        idSede,
      );

      const row = existing
        ? await this.model.updateValor(existing.id_valor, data)
        : await this.model.createValor(data);

      saved.push(row);
    }

    return saved;
  }
}
