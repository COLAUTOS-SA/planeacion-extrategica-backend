// src/services/ctera.service.js

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

const execAsync = util.promisify(exec);

const SMB_CONFIG = {
  host: "192.168.1.13",
  share: "vol1-usuarios",
  username: "escaner",
  password: "compartido1",
};

export class CteraService {
  static buildUserImagePath(userId, fileName) {
    return `ejepro/Usuarios/${userId}/avatar.webp`;
  }

  static async uploadUserImage(userId, fileBuffer) {
    const relativePath = this.buildUserImagePath(userId);
    const fileName = "avatar.webp";
    const tempPath = `/tmp/avatar_${userId}.webp`;

    await fs.promises.writeFile(tempPath, fileBuffer);

    const directory = path.dirname(relativePath);

    await this.createRemoteDirectory(directory);

    const command =
      `smbclient "//${SMB_CONFIG.host}/${SMB_CONFIG.share}" ` +
      `-U "${SMB_CONFIG.username}%${SMB_CONFIG.password}" ` +
      `-D "${directory}" ` +
      `-c "put \\"${tempPath}\\" \\"${fileName}\\""`; // SOBRESCRIBE

    await execAsync(command);

    await fs.promises.unlink(tempPath);

    return relativePath;
  }

  static buildResultadoEvidencePath(resultadoId, fileName) {
    return `ejepro/evidencias/Resultados/${resultadoId}/${fileName}`;
  }

  static async uploadResultadoEvidencia(resultadoId, fileName, buffer) {
    fileName = fileName.replace(/\s+/g, "_");

    const relativePath = this.buildResultadoEvidencePath(resultadoId, fileName);
    const directory = path.dirname(relativePath);
    const tempPath = `/tmp/${Date.now()}_${fileName}`;

    await fs.promises.writeFile(tempPath, buffer);

    await this.createRemoteDirectory(directory);

    const command =
      `smbclient "//${SMB_CONFIG.host}/${SMB_CONFIG.share}" ` +
      `-U "${SMB_CONFIG.username}%${SMB_CONFIG.password}" ` +
      `-D "${directory}" ` +
      `-c "put \\"${tempPath}\\" \\"${fileName}\\""`;

    await execAsync(command);

    await fs.promises.unlink(tempPath);

    return relativePath;
  }

  static async readEvidence(relativePath) {
    const fileName = path.basename(relativePath);
    const directory = path.dirname(relativePath);

    const tempPath = `/tmp/download_${Date.now()}_${fileName}`;

    const command =
      `smbclient "//${SMB_CONFIG.host}/${SMB_CONFIG.share}" ` +
      `-U "${SMB_CONFIG.username}%${SMB_CONFIG.password}" ` +
      `-D "${directory}" ` +
      `-c "get \\"${fileName}\\" \\"${tempPath}\\""`;

    await execAsync(command);

    const buffer = await fs.promises.readFile(tempPath);

    await fs.promises.unlink(tempPath);

    return buffer;
  }

  static async createRemoteDirectory(directory) {
    const parts = directory.split("/");

    let current = "";

    for (const part of parts) {
      current += part + "/";

      const command =
        `smbclient "//${SMB_CONFIG.host}/${SMB_CONFIG.share}" ` +
        `-U "${SMB_CONFIG.username}%${SMB_CONFIG.password}" ` +
        `-c "mkdir ${current}"`;

      try {
        await execAsync(command);
      } catch {
        // si ya existe no pasa nada
      }
    }
  }

  static async readFile(relativePath) {
    const fileName = "avatar.webp";
    const directory = path.dirname(relativePath);
    const tempPath = `/tmp/download_${Date.now()}_${fileName}`;

    const command =
      `smbclient "//${SMB_CONFIG.host}/${SMB_CONFIG.share}" ` +
      `-U "${SMB_CONFIG.username}%${SMB_CONFIG.password}" ` +
      `-D "${directory}" ` +
      `-c "get \\"${fileName}\\" \\"${tempPath}\\""`;

    await execAsync(command);

    const buffer = await fs.promises.readFile(tempPath);
    await fs.promises.unlink(tempPath);

    return buffer;
  }

  static async uploadAprendizajeEvidencia(aprendizajeId, fileName, buffer) {
    const relativePath = `Ejepro/Evidencias/Aprendizajes/${aprendizajeId}/${fileName}`;
    const directory = path.dirname(relativePath);
    const tempPath = `/tmp/${Date.now()}_${fileName}`;

    await fs.promises.writeFile(tempPath, buffer);

    await this.createRemoteDirectory(directory);

    const command =
      `smbclient "//${SMB_CONFIG.host}/${SMB_CONFIG.share}" ` +
      `-U "${SMB_CONFIG.username}%${SMB_CONFIG.password}" ` +
      `-D "${directory}" ` +
      `-c "put \\"${tempPath}\\" \\"${fileName}\\""`;

    await execAsync(command);

    await fs.promises.unlink(tempPath);

    return relativePath;
  }

  static async uploadPrioridadEvidencia(prioridadId, fileName, buffer) {
    const relativePath = `Ejepro/Evidencias/Prioridades/${prioridadId}/${fileName}`;
    const directory = path.dirname(relativePath);
    const tempPath = `/tmp/${Date.now()}_${fileName}`;

    await fs.promises.writeFile(tempPath, buffer);

    await this.createRemoteDirectory(directory);

    const command =
      `smbclient "//${SMB_CONFIG.host}/${SMB_CONFIG.share}" ` +
      `-U "${SMB_CONFIG.username}%${SMB_CONFIG.password}" ` +
      `-D "${directory}" ` +
      `-c "put \\"${tempPath}\\" \\"${fileName}\\""`;

    await execAsync(command);

    await fs.promises.unlink(tempPath);

    return relativePath;
  }

  static buildRepositorioLideresPath(eventoId, fileName) {
    const safeName = fileName.replace(/\s+/g, "_");
    return `Ejepro/Repositorio/Lideres/${eventoId}/${safeName}`;
  }

  static async uploadRepositorioLideresArchivo(eventoId, fileName, buffer) {
    const relativePath = this.buildRepositorioLideresPath(eventoId, fileName);
    const directory = path.dirname(relativePath);
    const baseName = path.basename(relativePath);
    const tempPath = `/tmp/${Date.now()}_${baseName}`;

    await fs.promises.writeFile(tempPath, buffer);
    await this.createRemoteDirectory(directory);

    const command =
      `smbclient "//${SMB_CONFIG.host}/${SMB_CONFIG.share}" ` +
      `-U "${SMB_CONFIG.username}%${SMB_CONFIG.password}" ` +
      `-D "${directory}" ` +
      `-c "put \\"${tempPath}\\" \\"${baseName}\\""`;

    await execAsync(command);
    await fs.promises.unlink(tempPath);

    return relativePath;
  }

  static async deleteFile(relativePath) {
    const fileName = path.basename(relativePath);
    const directory = path.dirname(relativePath);

    const command =
      `smbclient "//${SMB_CONFIG.host}/${SMB_CONFIG.share}" ` +
      `-U "${SMB_CONFIG.username}%${SMB_CONFIG.password}" ` +
      `-D "${directory}" ` +
      `-c "del \\"${fileName}\\""`;

    try {
      await execAsync(command);
    } catch {
      // si no existe o no se puede borrar en CTERA, no detenemos el flujo
    }
  }
}
