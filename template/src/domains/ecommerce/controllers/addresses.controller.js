import { AddressService } from '../services/addresses.service.js';

export const AddressController = {
  async create(req, res, next) {
    try {
      const address = await AddressService.create(req.user.id, req.body);
      res.status(201).json({ message: 'Dirección creada', address });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const addresses = await AddressService.findByUser(req.user.id);
      res.json(addresses);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const address = await AddressService.update(req.params.id, req.user.id, req.body);
      if (!address) return res.status(404).json({ error: 'Dirección no encontrada' });
      res.json({ message: 'Dirección actualizada', address });
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const deleted = await AddressService.delete(req.params.id, req.user.id);
      if (!deleted) return res.status(404).json({ error: 'Dirección no encontrada' });
      res.json({ message: 'Dirección eliminada' });
    } catch (error) {
      next(error);
    }
  },
};
