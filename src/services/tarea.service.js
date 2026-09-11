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
    const responsables = [
      ...new Set((data.responsables || []).map(Number)),
    ];

    if (!responsables.length) {
      throw new AppError(
        "Debes asignar al menos un responsable",
        400,
      );
    }

    const usuariosValidos =
      await this.model.countUsuariosByIds(responsables);

    if (usuariosValidos !== responsables.length) {
      throw new AppError(
        "Uno o varios responsables no existen",
        400,
      );
    }

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
          data.id_responsable ?? responsables[0],

        id_objetivo_especifico:
          data.id_objetivo_especifico,

        porcentaje_avance:
          porcentajeAvance,

        porcentaje_importancia:
          data.porcentaje_importancia ?? 100,
      });

    await this.model.replaceResponsables(
      tarea.id_tarea,
      responsables,
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

    if (data.id_objetivo_especifico) {
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
    }

    let responsables = null;

    if (Array.isArray(data.responsables)) {
      responsables = [
        ...new Set(data.responsables.map(Number)),
      ];

      if (!responsables.length) {
        throw new AppError(
          "Debes asignar al menos un responsable",
          400,
        );
      }

      const usuariosValidos =
        await this.model.countUsuariosByIds(responsables);

      if (usuariosValidos !== responsables.length) {
        throw new AppError(
          "Uno o varios responsables no existen",
          400,
        );
      }
    }

    const porcentajeAvance =
      this.calcularAvancePorEstado(
        idEstado,
        data.porcentaje_avance ??
          tarea.porcentaje_avance,
      );

    const { responsables: _responsables, ...updateData } = data;

    await this.model.update(id, {
      ...updateData,

      id_responsable:
        updateData.id_responsable ??
        responsables?.[0] ??
        undefined,

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

    if (responsables) {
      await this.model.replaceResponsables(
        id,
        responsables,
      );
    }

    await this.planeacionService.recalcularCadena(tarea.id_objetivo_especifico);

    if (
      data.id_objetivo_especifico &&
      data.id_objetivo_especifico !== tarea.id_objetivo_especifico
    ) {
      await this.planeacionService.recalcularCadena(data.id_objetivo_especifico);
    }

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
