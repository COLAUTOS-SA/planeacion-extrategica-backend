import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError.js";
import { prisma } from "../config/database.js";

const MESES_VALIDOS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

function toDecimalOrNull(value, fieldName) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = Number(value);
  if (Number.isNaN(normalized)) {
    throw new AppError(`El campo ${fieldName} debe ser numérico`, 400);
  }

  return new Prisma.Decimal(normalized);
}

function toNumber(value) {
  if (value === null || value === undefined) return null;
  return Number(value);
}

function calcIncrement(indicador, ejecutado) {
  if (indicador === null || indicador <= 0 || ejecutado === null) {
    return null;
  }

  const result = (ejecutado / indicador) * 100;
  return Number(result.toFixed(2));
}

export class PlanMensualService {
  constructor(model) {
    this.model = model;
  }

  normalizeAnio(anio) {
    const parsed = Number(anio);
    if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 2999) {
      throw new AppError("Año inválido", 400);
    }
    return parsed;
  }

  normalizeMes(mes) {
    const parsed = Number(mes);
    if (!Number.isInteger(parsed) || !MESES_VALIDOS.has(parsed)) {
      throw new AppError("Mes inválido. Debe estar entre 1 y 12", 400);
    }
    return parsed;
  }

  normalizeNegocioId(idNegocio) {
    const parsed = Number(idNegocio);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new AppError("Negocio inválido", 400);
    }
    return parsed;
  }

  async assertNegocioExists(idNegocio) {
    const negocio = await this.model.findNegocioById(idNegocio);
    if (!negocio) {
      throw new AppError("Negocio no encontrado", 404);
    }
    return negocio;
  }

  mapRow(row) {
    const indicador = toNumber(row.indicador);
    const ejecutado = toNumber(row.ejecutado);

    return {
      id_plan_mensual: row.id_plan_mensual,
      anio: row.anio,
      mes: row.mes,
      id_negocio: row.id_negocio,
      indicador,
      ejecutado,
      porcentaje_incremento: calcIncrement(indicador, ejecutado),
    };
  }

  async getByAnioNegocio(anio, idNegocio) {
    const parsedAnio = this.normalizeAnio(anio);
    const parsedNegocio = this.normalizeNegocioId(idNegocio);

    const negocio = await this.assertNegocioExists(parsedNegocio);
    const rows = await this.model.findByAnioNegocio(parsedAnio, parsedNegocio);

    return {
      anio: parsedAnio,
      id_negocio: parsedNegocio,
      negocio: negocio.nombre,
      items: rows.map((row) => this.mapRow(row)),
    };
  }

  async create(anio, idNegocio, payload) {
    const parsedAnio = this.normalizeAnio(anio);
    const parsedNegocio = this.normalizeNegocioId(idNegocio);
    const parsedMes = this.normalizeMes(payload.mes);

    await this.assertNegocioExists(parsedNegocio);

    const indicador =
      toDecimalOrNull(payload.indicador, "indicador") ?? new Prisma.Decimal(0);
    const ejecutado = toDecimalOrNull(payload.ejecutado, "ejecutado");

    try {
      const created = await this.model.create({
        anio: parsedAnio,
        mes: parsedMes,
        id_negocio: parsedNegocio,
        indicador,
        ejecutado,
      });

      // Crear automáticamente registros para todas las sedes
      const sedes = await prisma.sede.findMany({
        select: {
          id_sede: true,
        },
      });

      if (sedes.length > 0) {
        await prisma.plan_mensual_sede.createMany({
          data: sedes.map((sede) => ({
            id_plan_mensual: created.id_plan_mensual,
            id_sede: sede.id_sede,
            indicador: 0,
            ejecutado: 0,
          })),
        });
      }

      return this.mapRow(created);
    } catch (error) {
      if (error?.code === "P2002") {
        throw new AppError("Ya existe un registro mensual para ese mes", 409);
      }
      throw error;
    }
  }

  async update(idPlanMensual, payload) {
    const parsedId = Number(idPlanMensual);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      throw new AppError("Registro mensual inválido", 400);
    }

    const existing = await this.model.findById(parsedId);
    if (!existing) {
      throw new AppError("Registro mensual no encontrado", 404);
    }

    const data = {};

    if (payload.mes !== undefined) {
      data.mes = this.normalizeMes(payload.mes);
    }

    if (payload.indicador !== undefined) {
      data.indicador =
        toDecimalOrNull(payload.indicador, "indicador") ??
        new Prisma.Decimal(0);
    }

    if (payload.ejecutado !== undefined) {
      data.ejecutado = toDecimalOrNull(payload.ejecutado, "ejecutado");
    }

    try {
      const updated = await this.model.update(parsedId, data);
      return this.mapRow(updated);
    } catch (error) {
      if (error?.code === "P2002") {
        throw new AppError("Ya existe un registro mensual para ese mes", 409);
      }
      throw error;
    }
  }

  async remove(idPlanMensual) {
    const parsedId = Number(idPlanMensual);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      throw new AppError("Registro mensual inválido", 400);
    }

    const existing = await this.model.findById(parsedId);
    if (!existing) {
      throw new AppError("Registro mensual no encontrado", 404);
    }

    const deleted = await this.model.remove(parsedId);
    return this.mapRow(deleted);
  }
}
