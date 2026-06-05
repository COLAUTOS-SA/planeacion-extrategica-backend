import { AppError } from "../utils/AppError.js";
import { TareaModel } from "../models/tarea.model.js";
import { ObjetivoEspecificoModel } from "../models/objetivo_especifico.model.js";
import { PlaneacionEstrategicaService } from "./planeacion_estrategica.service.js";

export class TareaService {
  constructor(
    model = new TareaModel(),
  ) {
    this.model = model;

    this.objetivoModel =
      new ObjetivoEspecificoModel();

    this.planeacionService =
      new PlaneacionEstrategicaService();
  }

  calcularAvancePorEstado(
    idEstado,
    avance,
  ) {
    if (idEstado === 1) {
      return 0;
    }

    if (idEstado === 3) {
      return 100;
    }

    return avance ?? 0;
  }

  async getAll() {
    return this.model.findAll();
  }

  async getById(id) {
    const tarea =
      await this.model.findById(id);

    if (!tarea) {
      throw new AppError(
        "Tarea no encontrada",
        404,
      );
    }

    return tarea;
  }

  async create(data) {
    const objetivo =
      await this.objetivoModel.findById(
        data.id_objetivo_especifico,
      );

    if (!objetivo) {
      throw new AppError(
        "Objetivo específico no encontrado",
        400,
      );
    }

    const porcentajeAvance =
      this.calcularAvancePorEstado(
        data.id_estado,
        data.porcentaje_avance,
      );

    const tarea =
      await this.model.create({
        titulo: data.titulo,

        descripcion:
          data.descripcion,

        fecha_inicio:
          data.fecha_inicio
            ? new Date(
                data.fecha_inicio,
              )
            : null,

        fecha_fin:
          data.fecha_fin
            ? new Date(
                data.fecha_fin,
              )
            : null,

        prioridad:
          data.prioridad,

        id_estado:
          data.id_estado,

        id_responsable:
          data.id_responsable,

        id_objetivo_especifico:
          data.id_objetivo_especifico,

        porcentaje_avance:
          porcentajeAvance,
      });

    await this.model.replaceResponsables(
      tarea.id_tarea,
      data.responsables ?? [],
    );

    await this.planeacionService.recalcularCadena(
      tarea.id_objetivo_especifico,
    );

    return this.getById(
      tarea.id_tarea,
    );
  }

  async update(id, data) {
    const tarea =
      await this.model.findById(id);

    if (!tarea) {
      throw new AppError(
        "Tarea no encontrada",
        404,
      );
    }

    const idEstado =
      data.id_estado ??
      tarea.id_estado;

    const porcentajeAvance =
      this.calcularAvancePorEstado(
        idEstado,
        data.porcentaje_avance ??
          tarea.porcentaje_avance,
      );

    await this.model.update(id, {
      ...data,

      porcentaje_avance:
        porcentajeAvance,

      fecha_inicio:
        data.fecha_inicio
          ? new Date(
              data.fecha_inicio,
            )
          : undefined,

      fecha_fin:
        data.fecha_fin
          ? new Date(
              data.fecha_fin,
            )
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

    await this.planeacionService.recalcularCadena(
      tarea.id_objetivo_especifico,
    );

    return this.getById(id);
  }

  async delete(id) {
    const tarea =
      await this.model.findById(id);

    if (!tarea) {
      throw new AppError(
        "Tarea no encontrada",
        404,
      );
    }

    const objetivoId =
      tarea.id_objetivo_especifico;

    const result =
      await this.model.delete(id);

    await this.planeacionService.recalcularCadena(
      objetivoId,
    );

    return result;
  }
}