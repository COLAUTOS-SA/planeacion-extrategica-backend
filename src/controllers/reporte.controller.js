import { successResponse } from "../utils/response.js";

export class ReporteController {
  constructor(service) {
    this.service = service;
  }

  getLideres = async (req, res, next) => {
    try {
      const data = await this.service.getLideres(req.user);
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  };

  getFavoritos = async (req, res, next) => {
    try {
      const liderId = parseInt(req.params.id);
      const data = await this.service.getFavoritosByLider(req.user, liderId);

      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  };
}
