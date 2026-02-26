export class PrioridadService {
  constructor(model) {
    this.model = model;
  }

  async create(data, userId) {
    return this.model.create({
      ...data,
      fecha: data.fecha ? new Date(data.fecha) : null,
      id_responsable: userId,
    });
  }

  async getAll(userId) {
    return this.model.findAllByUser(userId);
  }

  async update(id, data, userId) {
    const existing = await this.model.findById(id);

    if (!existing) {
      throw { status: 404, message: "Prioridad no encontrada" };
    }

    if (existing.id_responsable !== userId) {
      throw { status: 403, message: "No autorizado" };
    }

    return this.model.update(id, data);
  }

  async delete(id, userId) {
    const existing = await this.model.findById(id);

    if (!existing) {
      throw { status: 404, message: "Prioridad no encontrada" };
    }

    if (existing.id_responsable !== userId) {
      throw { status: 403, message: "No autorizado" };
    }

    return this.model.delete(id);
  }
}
