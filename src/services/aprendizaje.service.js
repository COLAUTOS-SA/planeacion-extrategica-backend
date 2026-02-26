export class AprendizajeService {
  constructor(model) {
    this.model = model;
  }

  async create(data, userId) {
    return this.model.create({
      ...data,
      id_responsable: userId,
    });
  }

  async getAll(userId) {
    return this.model.findAllByUser(userId);
  }

  async update(id, data, userId) {
    const existing = await this.model.findById(id);

    if (!existing) {
      throw { status: 404, message: "Aprendizaje no encontrado" };
    }

    if (existing.id_responsable !== userId) {
      throw { status: 403, message: "No autorizado" };
    }

    return this.model.update(id, data);
  }

  async delete(id, userId) {
    const existing = await this.model.findById(id);

    if (!existing) {
      throw { status: 404, message: "Aprendizaje no encontrado" };
    }

    if (existing.id_responsable !== userId) {
      throw { status: 403, message: "No autorizado" };
    }

    return this.model.delete(id);
  }
}
