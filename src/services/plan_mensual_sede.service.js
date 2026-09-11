import { AppError } from "../utils/AppError.js";
import { PlanMensualSedeModel } from "../models/plan_mensual_sede.model.js";
import { PlanMensualModel } from "../models/plan_mensual.model.js";
import { SedeModel } from "../models/sede.model.js";

const sedeModel = new SedeModel();
const planMensualModel = new PlanMensualModel();

export class PlanMensualSedeService {
  constructor(model = new PlanMensualSedeModel()) {
    this.model = model;
  }

  async getByPlanMensual(idPlanMensual) {
    return this.model.findByPlanMensual(idPlanMensual);
  }

  async create(idPlanMensual, data) {
    const plan = await planMensualModel.findById(idPlanMensual);

    if (!plan) {
      throw new AppError("Plan mensual no encontrado", 404);
    }

    if (!(await sedeModel.exists(data.id_sede))) {
      throw new AppError("Sede no válida", 400);
    }

    const exists = await this.model.findByPlanAndSede(
      idPlanMensual,
      data.id_sede,
    );

    if (exists) {
      throw new AppError(
        "La sede ya existe para este mes",
        400,
      );
    }

    const row = await this.model.create({
      id_plan_mensual: idPlanMensual,
      ...data,
    });

    await this.recalculatePlanMensual(idPlanMensual);

    return row;
  }

  async update(id, data) {
    const existing = await this.model.findById(id);

    if (!existing) {
      throw new AppError(
        "Registro de sede no encontrado",
        404,
      );
    }

    const row = await this.model.update(id, data);

    await this.recalculatePlanMensual(
      existing.id_plan_mensual,
    );

    return row;
  }

  async delete(id) {
    const existing = await this.model.findById(id);

    if (!existing) {
      throw new AppError(
        "Registro de sede no encontrado",
        404,
      );
    }

    await this.model.delete(id);

    await this.recalculatePlanMensual(
      existing.id_plan_mensual,
    );
  }

  async recalculatePlanMensual(idPlanMensual) {
    const totals = await this.model.sumByPlanMensual(
      idPlanMensual,
    );

    await planMensualModel.update(idPlanMensual, {
      indicador:
        Number(totals._sum.indicador ?? 0),

      ejecutado:
        Number(totals._sum.ejecutado ?? 0),
    });
  }
}