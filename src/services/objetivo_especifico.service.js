import { AppError } from "../utils/AppError.js";
import { ObjetivoEspecificoModel } from "../models/objetivo_especifico.model.js";
import { ObjetivoGeneralModel } from "../models/objetivo_general.model.js";
import { prisma } from "../config/database.js";
import { PlaneacionEstrategicaService } from "./planeacion_estrategica.service.js";

export class ObjetivoEspecificoService {
  constructor(model = new ObjetivoEspecificoModel()) {
    this.model = model;

    this.objetivoGeneralModel = new ObjetivoGeneralModel();
    this.planeacionService = new PlaneacionEstrategicaService();
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

    const tareas = data.tareas ?? [];
    const pesoTotal = tareas.reduce(
      (total, tarea) => total + tarea.porcentaje_importancia,
      0,
    );

    if (tareas.length && Math.abs(pesoTotal - 100) > 0.001) {
      throw new AppError("La importancia de las tareas debe sumar 100%", 400);
    }

    const responsablesTareas = [...new Set(tareas.map((tarea) => tarea.id_responsable))];
    if (responsablesTareas.length) {
      const usuarios = await prisma.usuario.count({
        where: { id_usuario: { in: responsablesTareas } },
      });
      if (usuarios !== responsablesTareas.length) {
        throw new AppError("Uno o varios responsables de las tareas no existen", 400);
      }
    }

    const objetivo = await prisma.$transaction(async (tx) => {
      const nuevoObjetivo = await tx.objetivo_especifico.create({
        data: {
          titulo: data.titulo,
          descripcion: data.descripcion,
          fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : null,
          fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
          activo: data.activo ?? true,
          id_objetivo_general: data.id_objetivo_general,
        },
      });

      if (data.responsables?.length) {
        await tx.objetivo_especifico_responsable.createMany({
          data: [...new Set(data.responsables)].map((id_usuario) => ({
            id_objetivo_especifico: nuevoObjetivo.id_objetivo_especifico,
            id_usuario,
          })),
        });
      }

      if (data.interdependencias?.length) {
        await tx.objetivo_interdependencia.createMany({
          data: [...new Set(data.interdependencias)].map((id_usuario) => ({
            id_objetivo_especifico: nuevoObjetivo.id_objetivo_especifico,
            id_usuario,
          })),
        });
      }

      for (const tarea of tareas) {
        const creada = await tx.tarea.create({
          data: {
            titulo: tarea.titulo,
            descripcion: `Tarea inicial: ${tarea.titulo}`,
            id_objetivo_especifico: nuevoObjetivo.id_objetivo_especifico,
            id_responsable: tarea.id_responsable,
            id_estado: 1,
            porcentaje_avance: 0,
            porcentaje_importancia: tarea.porcentaje_importancia,
            prioridad: "MEDIA",
          },
        });
        await tx.tarea_responsable.create({
          data: { id_tarea: creada.id_tarea, id_usuario: tarea.id_responsable },
        });
      }
      return nuevoObjetivo;
    });

    if (tareas.length) {
      await this.planeacionService.recalcularCadena(objetivo.id_objetivo_especifico);
    }

    return this.getById(objetivo.id_objetivo_especifico);
  }

  async update(id, data) {
    const objetivo = await this.model.findById(id);

    if (!objetivo) {
      throw new AppError("Objetivo específico no encontrado", 404);
    }

    const { tareas: _tareas, responsables: _responsables, interdependencias: _interdependencias, ...datosObjetivo } = data;

    await this.model.update(id, {
      titulo: datosObjetivo.titulo,

      descripcion: datosObjetivo.descripcion,

      fecha_inicio: datosObjetivo.fecha_inicio ? new Date(datosObjetivo.fecha_inicio) : undefined,

      fecha_fin: datosObjetivo.fecha_fin ? new Date(datosObjetivo.fecha_fin) : undefined,

      activo: datosObjetivo.activo,

      id_objetivo_general: datosObjetivo.id_objetivo_general,
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
