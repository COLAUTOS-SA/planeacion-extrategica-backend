import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError.js";

function toDecimal(value, fieldName) {
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

  const diff = ((ejecutado - indicador) / indicador) * 100;
  return Number(diff.toFixed(2));
}

export class PlanAnualService {
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

  async getNegocios() {
    return this.model.findNegocios();
  }

  async createNegocio(nombre) {
    const clean = (nombre || "").trim();
    if (!clean) {
      throw new AppError("El nombre del negocio es obligatorio", 400);
    }
    return this.model.createNegocio(clean);
  }

  async updateNegocio(idNegocio, nombre) {
    const clean = (nombre || "").trim();
    if (!clean) {
      throw new AppError("El nombre del negocio es obligatorio", 400);
    }

    const existing = await this.model.findNegocioById(idNegocio);
    if (!existing) {
      throw new AppError("Negocio no encontrado", 404);
    }

    return this.model.updateNegocio(idNegocio, clean);
  }

  async deleteNegocio(idNegocio) {
    const existing = await this.model.findNegocioById(idNegocio);
    if (!existing) {
      throw new AppError("Negocio no encontrado", 404);
    }

    try {
      return await this.model.deleteNegocio(idNegocio);
    } catch (error) {
      if (error?.code === "P2003") {
        throw new AppError(
          "No puedes eliminar este negocio porque tiene registros asociados",
          409,
        );
      }
      throw error;
    }
  }

  async getPlanByAnio(anio) {
    const parsedAnio = this.normalizeAnio(anio);
    const [negocios, plan] = await Promise.all([
      this.model.findNegocios(),
      this.model.findPlanByAnio(parsedAnio),
    ]);

    const map = new Map(plan.map((row) => [row.id_negocio, row]));

    const data = negocios.map((negocio) => {
      const row = map.get(negocio.id_negocio);
      const indicador = toNumber(row?.indicador) ?? 0;
      const ejecutado = toNumber(row?.ejecutado);

      return {
        id_negocio: negocio.id_negocio,
        negocio: negocio.nombre,
        indicador,
        ejecutado,
        porcentaje_incremento: calcIncrement(indicador, ejecutado),
      };
    });

    const totalIndicador = data.reduce((acc, row) => acc + (row.indicador || 0), 0);
    const totalEjecutado = data.reduce(
      (acc, row) => acc + (row.ejecutado === null ? 0 : row.ejecutado),
      0,
    );
    const anyEjecutado = data.some((row) => row.ejecutado !== null);

    return {
      anio: parsedAnio,
      items: data,
      total: {
        indicador: Number(totalIndicador.toFixed(2)),
        ejecutado: anyEjecutado ? Number(totalEjecutado.toFixed(2)) : null,
        porcentaje_incremento: anyEjecutado
          ? calcIncrement(totalIndicador, totalEjecutado)
          : null,
      },
    };
  }

  async getPlanCompletoByAnio(anio) {
    const parsedAnio = this.normalizeAnio(anio);
    const [negocios, planMensual] = await Promise.all([
      this.model.findNegocios(),
      this.model.findPlanMensualByAnio(parsedAnio),
    ]);

    const mensualByNegocio = new Map();
    planMensual.forEach((row) => {
      const rows = mensualByNegocio.get(row.id_negocio) ?? [];
      rows.push({
        id_plan_mensual: row.id_plan_mensual,
        anio: row.anio,
        mes: row.mes,
        id_negocio: row.id_negocio,
        indicador: toNumber(row.indicador) ?? 0,
        ejecutado: toNumber(row.ejecutado),
      });
      mensualByNegocio.set(row.id_negocio, rows);
    });

    const data = negocios.map((negocio) => {
      const mensual = mensualByNegocio.get(negocio.id_negocio) ?? [];
      const indicador = mensual.reduce(
        (acc, month) => acc + (month.indicador || 0),
        0,
      );
      const hasEjecutado = mensual.some((month) => month.ejecutado !== null);
      const ejecutado = mensual.reduce(
        (acc, month) => acc + (month.ejecutado || 0),
        0,
      );

      return {
        id_negocio: negocio.id_negocio,
        negocio: negocio.nombre,
        indicador: Number(indicador.toFixed(2)),
        ejecutado: hasEjecutado ? Number(ejecutado.toFixed(2)) : null,
        porcentaje_incremento: hasEjecutado
          ? calcIncrement(indicador, ejecutado)
          : null,
        mensual,
      };
    });

    const totalIndicador = data.reduce((acc, row) => acc + (row.indicador || 0), 0);
    const totalEjecutado = data.reduce(
      (acc, row) => acc + (row.ejecutado === null ? 0 : row.ejecutado),
      0,
    );
    const anyEjecutado = data.some((row) => row.ejecutado !== null);

    return {
      anio: parsedAnio,
      items: data,
      total: {
        indicador: Number(totalIndicador.toFixed(2)),
        ejecutado: anyEjecutado ? Number(totalEjecutado.toFixed(2)) : null,
        porcentaje_incremento: anyEjecutado
          ? calcIncrement(totalIndicador, totalEjecutado)
          : null,
      },
    };
  }

  async savePlanByAnio(anio, items) {
    const parsedAnio = this.normalizeAnio(anio);

    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError("Debes enviar al menos un item", 400);
    }

    const negocios = await this.model.findNegocios();
    const negocioIds = new Set(negocios.map((n) => n.id_negocio));

    const sanitized = items.map((item) => {
      const idNegocio = Number(item.id_negocio);
      if (!Number.isInteger(idNegocio) || !negocioIds.has(idNegocio)) {
        throw new AppError(`Negocio inválido: ${item.id_negocio}`, 400);
      }

      const indicador = toDecimal(item.indicador ?? 0, "indicador");
      const ejecutado = toDecimal(item.ejecutado, "ejecutado");

      return {
        id_negocio: idNegocio,
        indicador: indicador ?? new Prisma.Decimal(0),
        ejecutado,
      };
    });

    await this.model.upsertPlanItems(parsedAnio, sanitized);
    return this.getPlanByAnio(parsedAnio);
  }
}
