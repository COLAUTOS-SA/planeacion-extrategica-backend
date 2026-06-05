import { AppError } from "../utils/AppError.js";
import { ObjetivoGeneralModel } from "../models/objetivo_general.model.js";
import { PerspectivaModel } from "../models/perspectiva.model.js";
import { UserModel } from "../models/user.model.js";

export class ObjetivoGeneralService {
  constructor(
    model = new ObjetivoGeneralModel(),
  ) {
    this.model = model;

    this.perspectivaModel =
      new PerspectivaModel();

    this.userModel =
      new UserModel();
  }

  async getAll() {
    return this.model.findAll();
  }

  async getById(id) {
    const item =
      await this.model.findById(id);

    if (!item) {
      throw new AppError(
        "Objetivo general no encontrado",
        404,
      );
    }

    return item;
  }

  async create(data) {
    const perspectiva =
      await this.perspectivaModel.findById(
        data.id_perspectiva,
      );

    if (!perspectiva) {
      throw new AppError(
        "Perspectiva no encontrada",
        400,
      );
    }

    const objetivo =
      await this.model.create({
        titulo: data.titulo,
        descripcion: data.descripcion,
        fecha_inicio: data.fecha_inicio
          ? new Date(data.fecha_inicio)
          : null,
        fecha_fin: data.fecha_fin
          ? new Date(data.fecha_fin)
          : null,
        id_perspectiva:
          data.id_perspectiva,
        id_responsable:
          data.id_responsable,
        activo:
          data.activo ?? true,
      });

    await this.model.replaceResponsables(
      objetivo.id_objetivo_general,
      data.responsables ?? [],
    );

    return this.getById(
      objetivo.id_objetivo_general,
    );
  }

  async update(id, data) {
    const objetivo =
      await this.model.findById(id);

    if (!objetivo) {
      throw new AppError(
        "Objetivo general no encontrado",
        404,
      );
    }

    await this.model.update(id, {
      ...data,
      fecha_inicio: data.fecha_inicio
        ? new Date(data.fecha_inicio)
        : undefined,
      fecha_fin: data.fecha_fin
        ? new Date(data.fecha_fin)
        : undefined,
    });

    if (
      Array.isArray(
        data.responsables,
      )
    ) {
      await this.model.replaceResponsables(
        id,
        data.responsables,
      );
    }

    return this.getById(id);
  }

  async delete(id) {
    const objetivo =
      await this.model.findById(id);

    if (!objetivo) {
      throw new AppError(
        "Objetivo general no encontrado",
        404,
      );
    }

    const total =
      await this.model.countObjetivosEspecificos(
        id,
      );

    if (total > 0) {
      throw new AppError(
        "No se puede eliminar porque tiene objetivos específicos asociados",
        400,
      );
    }

    return this.model.delete(id);
  }
}