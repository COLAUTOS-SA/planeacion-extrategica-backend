import { AppError } from "../utils/AppError.js";
import { SedeModel } from "../models/sede.model.js";

export class SedeService {
  constructor(model = new SedeModel()) {
    this.model = model;
  }

  async getAll() {
    return this.model.findAll();
  }

  async getById(id) {
    const sede = await this.model.findById(id);

    if (!sede) {
      throw new AppError("Sede no encontrada", 404);
    }

    return sede;
  }

  async create(data) {
    const exists = await this.model.existsByName(data.nombre);

    if (exists) {
      throw new AppError("Ya existe una sede con ese nombre", 400);
    }

    return this.model.create(data);
  }

  async update(id, data) {
    const sede = await this.model.findById(id);

    if (!sede) {
      throw new AppError("Sede no encontrada", 404);
    }

    return this.model.update(id, data);
  }

  async delete(id) {
    const sede = await this.model.findById(id);

    if (!sede) {
      throw new AppError("Sede no encontrada", 404);
    }

    return this.model.delete(id);
  }
}