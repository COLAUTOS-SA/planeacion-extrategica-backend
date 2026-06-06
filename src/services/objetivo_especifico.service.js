import { AppError } from "../utils/AppError.js";
import { ObjetivoEspecificoModel } from "../models/objetivo_especifico.model.js";
import { ObjetivoGeneralModel } from "../models/objetivo_general.model.js";

export class ObjetivoEspecificoService {
  constructor(model = new ObjetivoEspecificoModel()) {
    this.model = model;

    this.objetivoGeneralModel = new ObjetivoGeneralModel();
  }

  async getAll() {
    return this.model.findAll();
  }

  async getById(id) {
    const item = await this.model.findById(id);

    if (!item) {
      throw new AppError("Objetivo específico no encontrado", 404);
    }

    return item;
  }

  async create(data) {
    const objetivoGeneral = await this.objetivoGeneralModel.findById(
      data.id_objetivo_general,
    );

    if (!objetivoGeneral) {
      throw new AppError("Objetivo general no encontrado", 400);
    }

    const objetivo = await this.model.create({
      titulo: data.titulo,

      descripcion: data.descripcion,

      fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : null,

      fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,

      activo: data.activo ?? true,

      id_objetivo_general: data.id_objetivo_general,
    });

    await this.model.replaceResponsables(
      objetivo.id_objetivo_especifico,
      data.responsables ?? [],
    );

    await this.model.replaceInterdependencias(
      objetivo.id_objetivo_especifico,
      data.interdependencias ?? [],
    );

    return this.getById(objetivo.id_objetivo_especifico);
  }

  async update(id, data) {
    const objetivo = await this.model.findById(id);

    if (!objetivo) {
      throw new AppError("Objetivo específico no encontrado", 404);
    }

    await this.model.update(id, {
      titulo: data.titulo,

      descripcion: data.descripcion,

      fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : undefined,

      fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : undefined,

      activo: data.activo,

      id_objetivo_general: data.id_objetivo_general,
    });

    if (Array.isArray(data.responsables)) {
      await this.model.replaceResponsables(id, data.responsables);
    }

    if (Array.isArray(data.interdependencias)) {
      await this.model.replaceInterdependencias(id, data.interdependencias);
    }

    return this.getById(id);
  }

  async delete(id) {
    const objetivo = await this.model.findById(id);

    if (!objetivo) {
      throw new AppError("Objetivo específico no encontrado", 404);
    }

    const total = await this.model.countTareas(id);

    if (total > 0) {
      throw new AppError(
        "No se puede eliminar porque tiene tareas asociadas",
        400,
      );
    }

    return this.model.delete(id);
  }
}
