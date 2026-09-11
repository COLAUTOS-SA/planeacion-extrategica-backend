import { EvidenciaModel } from "../models/evidencia.model.js";
import { CteraService } from "./ctera.service.js";
import { prisma } from "../config/database.js";

export class EvidenciaService {
  constructor() {
    this.model = new EvidenciaModel();
  }

  async uploadFiles(resultadoId, files) {
    const evidencias = [];

    await Promise.all(
      files.map(async (file) => {
        const fileName = `${Date.now()}_${file.originalname}`;

        const remotePath = await CteraService.uploadResultadoEvidencia(
          resultadoId,
          fileName,
          file.buffer,
        );

        const tipo = file.mimetype.startsWith("video") ? "video" : "imagen";

        return this.model.create({
          tipo,
          url: remotePath,
          id_resultado: resultadoId,
        });
      }),
    );

    return evidencias;
  }

  async createLink(resultadoId, url, descripcion) {
    return this.model.create({
      tipo: "link",
      url,
      descripcion,
      id_resultado: resultadoId,
    });
  }

  async getFile(id) {
    const evidencia = await this.model.findById(id);

    if (!evidencia) {
      throw new Error("Evidencia no encontrada");
    }

    if (evidencia.tipo === "link") {
      return {
        tipo: "link",
        url: evidencia.url,
      };
    }

    const buffer = await CteraService.readEvidence(evidencia.url);

    return {
      tipo: evidencia.tipo,
      url: evidencia.url,
      buffer,
    };
  }

  async delete(id) {
    return this.model.delete(id);
  }

  async uploadFilesAprendizaje(aprendizajeId, files) {
    const evidencias = [];

    await Promise.all(
      files.map(async (file) => {
        const fileName = `${Date.now()}_${file.originalname}`;

        const remotePath = await CteraService.uploadAprendizajeEvidencia(
          aprendizajeId,
          fileName,
          file.buffer,
        );

        const tipo = file.mimetype.startsWith("video") ? "video" : "imagen";

        const evidencia = await this.model.create({
          tipo,
          url: remotePath,
          id_aprendizaje: aprendizajeId,
        });

        evidencias.push(evidencia);
      }),
    );

    return evidencias;
  }

  async createLinkAprendizaje(aprendizajeId, url, descripcion) {
    return this.model.create({
      tipo: "link",
      url,
      descripcion,
      id_aprendizaje: aprendizajeId,
    });
  }

  async uploadFilesPrioridad(prioridadId, files) {
    const evidencias = [];

    await Promise.all(
      files.map(async (file) => {
        const fileName = `${Date.now()}_${file.originalname}`;

        const remotePath = await CteraService.uploadPrioridadEvidencia(
          prioridadId,
          fileName,
          file.buffer,
        );

        const tipo = file.mimetype.startsWith("video") ? "video" : "imagen";

        const evidencia = await this.model.create({
          tipo,
          url: remotePath,
          id_prioridad: prioridadId,
        });

        evidencias.push(evidencia);
      }),
    );

    return evidencias;
  }

  async createLinkPrioridad(prioridadId, url, descripcion) {
    return this.model.create({
      tipo: "link",
      url,
      descripcion,
      id_prioridad: prioridadId,
    });
  }
}
