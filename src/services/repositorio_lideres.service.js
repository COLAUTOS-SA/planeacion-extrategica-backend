import { AppError } from "../utils/AppError.js";
import { CteraService } from "./ctera.service.js";

function parseDateOnly(fecha) {
  const parsed = new Date(`${fecha}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError("Fecha inválida. Usa formato YYYY-MM-DD", 400);
  }
  return parsed;
}

function endOfDayUTC(date) {
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

function parseRoles(user) {
  if (!user) return [];
  const all = [];

  if (user.rol) all.push(user.rol);
  if (user.id_rol !== undefined && user.id_rol !== null) all.push(user.id_rol);
  if (Array.isArray(user.roles)) all.push(...user.roles);

  return all
    .flatMap((role) => {
      if (role === null || role === undefined) return [];
      if (typeof role === "string" || typeof role === "number") {
        return [String(role).toLowerCase()];
      }
      if (typeof role === "object") {
        return [role.id, role.nombre, role.value]
          .filter((value) => value !== undefined && value !== null)
          .map((value) => String(value).toLowerCase());
      }
      return [];
    })
    .filter(Boolean);
}

function canEdit(user) {
  const roles = parseRoles(user);
  return roles.includes("admin") || roles.includes("2");
}

export class RepositorioLideresService {
  constructor(model) {
    this.model = model;
  }

  validateEditPermission(user) {
    if (!canEdit(user)) {
      throw new AppError(
        "No tienes permisos para modificar el repositorio de líderes",
        403,
      );
    }
  }

  async getEventoByFecha(fecha) {
    const fechaDate = parseDateOnly(fecha);
    return this.model.findEventoByFecha(fechaDate);
  }

  async getEventosByRango(from, to) {
    const fechaDesde = parseDateOnly(from);
    const fechaHasta = parseDateOnly(to);
    const fechaHastaFin = endOfDayUTC(fechaHasta);

    if (fechaDesde > fechaHastaFin) {
      throw new AppError("El rango de fechas es inválido", 400);
    }

    return this.model.findEventosByRango(fechaDesde, fechaHastaFin);
  }

  async saveResumen(fecha, resumen, user) {
    this.validateEditPermission(user);

    const fechaDate = parseDateOnly(fecha);
    const resumenLimpio = (resumen || "").trim();
    const existing = await this.model.findEventoByFecha(fechaDate);

    if (existing) {
      return this.model.updateEvento(existing.id_evento, {
        resumen_reunion: resumenLimpio,
      });
    }

    return this.model.createEvento({
      fecha: fechaDate,
      resumen_reunion: resumenLimpio,
      id_usuario_creador: user.id,
    });
  }

  async uploadArchivos(fecha, files, user) {
    this.validateEditPermission(user);

    if (!files?.length) {
      throw new AppError("Debes enviar al menos un archivo", 400);
    }

    const fechaDate = parseDateOnly(fecha);
    let evento = await this.model.findEventoByFecha(fechaDate);

    if (!evento) {
      evento = await this.model.createEvento({
        fecha: fechaDate,
        resumen_reunion: "",
        id_usuario_creador: user.id,
      });
    }

    const saved = [];

    for (const file of files) {
      const generatedName = `${Date.now()}_${file.originalname}`;
      const ruta = await CteraService.uploadRepositorioLideresArchivo(
        evento.id_evento,
        generatedName,
        file.buffer,
      );

      const row = await this.model.createDocumento({
        nombre_archivo: file.originalname,
        ruta,
        fecha: fechaDate,
        id_evento: evento.id_evento,
        id_usuario_creador: user.id,
      });

      saved.push(row);
    }

    return saved;
  }

  async deleteDocumento(idDocumento, user) {
    this.validateEditPermission(user);

    const existing = await this.model.findDocumentoById(idDocumento);
    if (!existing) {
      throw new AppError("Documento no encontrado", 404);
    }

    await this.model.deleteDocumento(idDocumento);
    await CteraService.deleteFile(existing.ruta);

    return { id_documento: idDocumento };
  }

  async downloadDocumento(idDocumento) {
    const existing = await this.model.findDocumentoById(idDocumento);
    if (!existing) {
      throw new AppError("Documento no encontrado", 404);
    }

    const buffer = await CteraService.readEvidence(existing.ruta);

    return {
      fileName: existing.nombre_archivo || "archivo",
      buffer,
    };
  }
}
