import { StoreService } from '../services/stores.service.js';

export const StoreController = {
  async create(req, res, next) {
    try {
      const store = await StoreService.create(req.body);
      res.status(201).json({ message: 'Local creado', store });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const stores = await StoreService.findAll();
      res.json(stores);
    } catch (error) {
      next(error);
    }
  },

  async getPickupStores(req, res, next) {
    try {
      const stores = await StoreService.findActivePickupStores();
      res.json(stores);
    } catch (error) {
      next(error);
    }
  },

  async getOne(req, res, next) {
    try {
      const store = await StoreService.findById(req.params.id);
      if (!store) return res.status(404).json({ error: 'Local no encontrado' });
      res.json(store);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const store = await StoreService.update(req.params.id, req.body);
      if (!store) return res.status(404).json({ error: 'Local no encontrado' });
      res.json({ message: 'Local actualizado', store });
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const deleted = await StoreService.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Local no encontrado' });
      res.json({ message: 'Local eliminado' });
    } catch (error) {
      next(error);
    }
  },
};
