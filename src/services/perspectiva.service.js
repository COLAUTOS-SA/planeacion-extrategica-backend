import { AppError } from "../utils/AppError.js";
import { PerspectivaModel } from "../models/perspectiva.model.js";

export class PerspectivaService {
  constructor(model = new PerspectivaModel()) {
    this.model = model;
  }

  async getAll() {
    return this.model.findAll();
  }

  async getById(id) {
    const perspectiva = await this.model.findById(id);

    if (!perspectiva) {
      throw new AppError(
        "Perspectiva no encontrada",
        404,
      );
    }

    return perspectiva;
  }

  async create(data) {
    const exists =
      await this.model.findByName(
        data.nombre,
      );

    if (exists) {
      throw new AppError(
        "Ya existe una perspectiva con ese nombre",
        400,
      );
    }

    return this.model.create(data);
  }

  async update(id, data) {
    const perspectiva =
      await this.model.findById(id);

    if (!perspectiva) {
      throw new AppError(
        "Perspectiva no encontrada",
        404,
      );
    }

    if (
      data.nombre &&
      data.nombre !== perspectiva.nombre
    ) {
      const exists =
        await this.model.findByName(
          data.nombre,
        );

      if (exists) {
        throw new AppError(
          "Ya existe una perspectiva con ese nombre",
          400,
        );
      }
    }

    return this.model.update(id, data);
  }

  async delete(id) {
    const perspectiva =
      await this.model.findById(id);

    if (!perspectiva) {
      throw new AppError(
        "Perspectiva no encontrada",
        404,
      );
    }

    const totalObjetivos =
      await this.model.countObjetivos(id);

    if (totalObjetivos > 0) {
      throw new AppError(
        "No se puede eliminar una perspectiva con objetivos asociados",
        400,
      );
    }

    return this.model.delete(id);
  }
}