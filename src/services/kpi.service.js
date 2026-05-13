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

const sortByName = (a, b) =>
  String(a?.nombre || "").localeCompare(String(b?.nombre || ""), "es", {
    sensitivity: "base",
  });

export class KpiService {
  constructor(model) {
    this.model = model;
  }

  assertKpiReadableByUser(kpi, user) {
    const roles = normalizeRoles(user);
    if (isAdminLike(roles)) return;

    if (kpi.id_responsable === user.id) return;

    throw new AppError("No autorizado para consultar este KPI", 403);
  }

  assertKpiEditableByUser(kpi, user) {
    const roles = normalizeRoles(user);
    if (isAdminLike(roles)) return;

    if (kpi.id_responsable === user.id) return;

    throw new AppError("No autorizado", 403);
  }

  normalizeSedes(sedes = []) {
    if (!Array.isArray(sedes)) {
      throw new AppError("El campo sedes debe ser un arreglo", 400);
    }
    return [
      ...new Set(
        sedes.map((id) => Number(id)).filter((id) => Number.isInteger(id)),
      ),
    ];
  }

  normalizeIndicadores(indicadores = []) {
    if (!Array.isArray(indicadores)) {
      throw new AppError("El campo indicadores debe ser un arreglo", 400);
    }

    const parsed = indicadores
      .map((item) => {
        if (typeof item === "string") {
          return {
            nombre: item.trim(),
            campos: [
              { nombre: "Objetivo", tipo: "numero", requerido: false },
              { nombre: "Resultado", tipo: "numero", requerido: false },
            ],
          };
        }

        return {
          nombre: String(item?.nombre || "").trim(),
          campos: Array.isArray(item?.campos)
            ? item.campos
                .map((campo, index) => ({
                  nombre: String(campo?.nombre || "").trim(),
                  tipo: campo?.tipo || "numero",
                  orden: campo?.orden || index + 1,
                  requerido: Boolean(campo?.requerido),
                  editable: campo?.editable !== false,
                  es_calculado: Boolean(campo?.es_calculado),
                  formula: campo?.formula || null,
                }))
                .filter((campo) => campo.nombre)
            : [],
        };
      })
      .filter((item) => item.nombre);

    return parsed.map((item) => ({
      ...item,
      campos:
        item.campos.length > 0
          ? item.campos
          : [
              { nombre: "Objetivo", tipo: "numero", requerido: false },
              { nombre: "Resultado", tipo: "numero", requerido: false },
            ],
    }));
  }

  normalizeIndicadoresFromDb(indicadores = []) {
    return (indicadores || [])
      .map((item) => ({
        nombre: String(item?.nombre || "").trim(),
        campos: (item?.kpi_indicador_campo || [])
          .map((campo, index) => ({
            nombre: String(campo?.nombre || "").trim(),
            tipo: campo?.tipo || "numero",
            orden: campo?.orden || index + 1,
            requerido: Boolean(campo?.requerido),
            editable: campo?.editable !== false,
            es_calculado: Boolean(campo?.es_calculado),
            formula: campo?.formula || null,
          }))
          .filter((campo) => campo.nombre),
      }))
      .filter((item) => item.nombre);
  }

  indicadoresFingerprint(indicadores = []) {
    const normalized = (indicadores || [])
      .map((indicador) => ({
        nombre: String(indicador.nombre || "").trim().toLowerCase(),
        campos: (indicador.campos || [])
          .map((campo) => ({
            nombre: String(campo.nombre || "").trim().toLowerCase(),
            tipo: campo.tipo || "numero",
            orden: Number(campo.orden) || 0,
            requerido: Boolean(campo.requerido),
            editable: campo.editable !== false,
            es_calculado: Boolean(campo.es_calculado),
            formula: campo.formula || null,
          }))
          .sort((a, b) => a.orden - b.orden || sortByName(a, b)),
      }))
      .sort(sortByName);

    return JSON.stringify(normalized);
  }

  normalizeValorCampos(campos = [], availableCampos = []) {
    if (!Array.isArray(campos)) {
      throw new AppError("El campo campos debe ser un arreglo", 400);
    }

    const allowed = new Map(
      availableCampos.map((campo) => [campo.id_campo, campo]),
    );

    return campos.map((campo) => {
      const idCampo = Number(campo.id_campo);
      const source = allowed.get(idCampo);
      if (!source) {
        throw new AppError(`Campo inválido: ${campo.id_campo}`, 400);
      }

      return {
        id_campo: idCampo,
        valor_decimal: parseDecimal(campo.valor_decimal, source.nombre),
        valor_texto:
          campo.valor_texto === undefined || campo.valor_texto === null
            ? null
            : String(campo.valor_texto),
      };
    });
  }

  async getSedes() {
    return this.model.findSedes();
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

  async getAll(user) {
    const roles = normalizeRoles(user);
    const where = isAdminLike(roles) ? {} : { id_responsable: user.id };
    return this.model.findAll(where);
  }

  async getById(idKpi, user) {
    const kpi = await this.model.findById(idKpi);
    if (!kpi) {
      throw new AppError("KPI no encontrado", 404);
    }

    this.assertKpiReadableByUser(kpi, user);
    return kpi;
  }

  async create(payload, user) {
    const roles = normalizeRoles(user);
    const sedes = this.normalizeSedes(payload.sedes);
    const indicadores = this.normalizeIndicadores(payload.indicadores);

    if (!payload.titulo?.trim()) {
      throw new AppError("El título es obligatorio", 400);
    }

    if (!sedes.length) {
      throw new AppError("Debes asignar al menos una sede", 400);
    }

    if (!indicadores.length) {
      throw new AppError("Debes enviar al menos un indicador", 400);
    }

    let idResponsable = Number(payload.id_responsable);
    if (!Number.isInteger(idResponsable)) {
      idResponsable = user.id;
    }

    if (!isAdminLike(roles) && idResponsable !== user.id) {
      throw new AppError("No autorizado para asignar otro responsable", 403);
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
    await this.model.replaceIndicadoresWithCampos(created.id_kpi, indicadores);

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
      await this.model.replaceKpiSedes(idKpi, sedes);
    }

    if (payload.indicadores !== undefined) {
      const indicadores = this.normalizeIndicadores(payload.indicadores);
      if (!indicadores.length) {
        throw new AppError("Debes enviar al menos un indicador", 400);
      }

      const currentIndicadores = this.normalizeIndicadoresFromDb(
        kpi.kpi_indicador || [],
      );

      const incomingFp = this.indicadoresFingerprint(indicadores);
      const currentFp = this.indicadoresFingerprint(currentIndicadores);

      if (incomingFp !== currentFp) {
        await this.model.replaceIndicadoresWithCampos(idKpi, indicadores);
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
    return this.model.delete(idKpi);
  }

  async saveValor(payload, user) {
    const fecha = parseDateOnly(payload.fecha);
    const idIndicador = Number(payload.id_indicador);
    if (!Number.isInteger(idIndicador)) {
      throw new AppError("id_indicador inválido", 400);
    }

    const indicador = await this.model.findIndicadorById(idIndicador);
    if (!indicador) {
      throw new AppError("Indicador no encontrado", 404);
    }
    this.assertKpiEditableByUser(indicador.kpi, user);

    const idSede =
      payload.id_sede === null || payload.id_sede === undefined || payload.id_sede === ""
        ? null
        : Number(payload.id_sede);
    if (idSede !== null && !Number.isInteger(idSede)) {
      throw new AppError("id_sede inválido", 400);
    }

    if (idSede !== null) {
      const enabled = indicador.kpi.kpi_sede.some((x) => x.id_sede === idSede);
      if (!enabled) {
        throw new AppError("La sede no está asociada al KPI", 400);
      }
    }

    const campos = this.normalizeValorCampos(
      payload.campos || [],
      indicador.kpi_indicador_campo || [],
    );

    const legacyObjetivo = parseDecimal(payload.objetivo, "objetivo");
    const legacyResultado = parseDecimal(payload.resultado, "resultado");

    const existing = await this.model.findValorByUniqueTuple(
      idIndicador,
      fecha,
      idSede,
    );

    if (existing) {
      await this.model.updateValor(
        existing.id_valor,
        {
          id_sede: idSede,
          fecha,
          objetivo: legacyObjetivo,
          resultado: legacyResultado,
          updated_by: user.id,
          deleted_at: null,
          deleted_by: null,
        },
        campos,
      );
      return this.model.findValorById(existing.id_valor);
    }

    const created = await this.model.createValor(
      {
        id_indicador: idIndicador,
        id_sede: idSede,
        fecha,
        objetivo: legacyObjetivo,
        resultado: legacyResultado,
        created_by: user.id,
      },
      campos,
    );
    return this.model.findValorById(created.id_valor);
  }

  async updateValor(idValor, payload, user) {
    const existing = await this.model.findValorById(idValor);
    if (!existing || existing.deleted_at) {
      throw new AppError("Valor no encontrado", 404);
    }

    this.assertKpiEditableByUser(existing.kpi_indicador.kpi, user);

    const fecha = payload.fecha ? parseDateOnly(payload.fecha) : existing.fecha;
    const idSede =
      payload.id_sede === undefined
        ? existing.id_sede
        : payload.id_sede === null || payload.id_sede === ""
          ? null
          : Number(payload.id_sede);

    if (idSede !== null && !Number.isInteger(idSede)) {
      throw new AppError("id_sede inválido", 400);
    }

    const campos = this.normalizeValorCampos(
      payload.campos || [],
      existing.kpi_indicador.kpi_indicador_campo || [],
    );

    await this.model.updateValor(
      idValor,
      {
        fecha,
        id_sede: idSede,
        objetivo:
          payload.objetivo !== undefined
            ? parseDecimal(payload.objetivo, "objetivo")
            : existing.objetivo,
        resultado:
          payload.resultado !== undefined
            ? parseDecimal(payload.resultado, "resultado")
            : existing.resultado,
        updated_by: user.id,
      },
      campos,
    );

    return this.model.findValorById(idValor);
  }

  async deleteValor(idValor, user) {
    const existing = await this.model.findValorById(idValor);
    if (!existing || existing.deleted_at) {
      throw new AppError("Valor no encontrado", 404);
    }
    this.assertKpiEditableByUser(existing.kpi_indicador.kpi, user);
    return this.model.softDeleteValor(idValor, user.id);
  }
}
