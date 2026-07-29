import { ProductImageService } from '../services/productImages.service.js';

export const ProductImageController = {
  async add(req, res, next) {
    try {
      const { urls } = req.body;
      const images = await ProductImageService.addUrls(req.params.id, urls);
      res.status(201).json({ message: 'Imágenes agregadas', images });
    } catch (error) {
      next(error);
    }
  },

  async addFromFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se envió ningún archivo' });
      }
      const images = await ProductImageService.addFromFile(req.params.id, req.file);
      res.status(201).json({ message: 'Imágenes extraídas y agregadas', images });
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const images = await ProductImageService.list(req.params.id);
      res.json(images);
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const deleted = await ProductImageService.remove(req.params.id, req.params.imageId);
      if (!deleted) return res.status(404).json({ error: 'Imagen no encontrada' });
      res.json({ message: 'Imagen eliminada' });
    } catch (error) {
      next(error);
    }
  },

  async setMain(req, res, next) {
    try {
      const image = await ProductImageService.setMain(req.params.id, req.params.imageId);
      if (!image) return res.status(404).json({ error: 'Imagen no encontrada' });
      res.json({ message: 'Imagen principal actualizada', image });
    } catch (error) {
      next(error);
    }
  },
};
