import { getUserById, updateUser, getAllUsers, deleteUser, blockUser, verifyUserManual, getUserStats } from '../services/users.services.js';
import { logAdminAction } from '../services/audit.services.js';

export const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user._id);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const getStatsController = async (req, res, next) => {
  try {
    const stats = await getUserStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

export const getAllUsersController = async (req, res, next) => {
  try {
    const { startDate, endDate, sortOrder } = req.query;
    const users = await getAllUsers({ startDate, endDate, sortOrder });
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

export const getUserController = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (req, res, next) => {
  try {
    await deleteUser(req.params.id);
    await logAdminAction(req.user._id, 'DELETE_USER', req.params.id);
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

export const blockUserController = async (req, res, next) => {
  try {
    const { isBlocked } = req.body;
    const user = await blockUser(req.params.id, isBlocked);
    await logAdminAction(req.user._id, isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER', req.params.id);
    res.status(200).json({
      message: `Usuario ${isBlocked ? 'bloqueado' : 'desbloqueado'} correctamente`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyUserController = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    const user = await verifyUserManual(req.params.id, isVerified);
    await logAdminAction(req.user._id, isVerified ? 'VERIFY_USER' : 'UNVERIFY_USER', req.params.id);
    res.status(200).json({
      message: `Usuario ${isVerified ? 'verificado' : 'desverificado'} correctamente`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const user = await updateUser(req.user._id, req.body);
    res.status(200).json({ message: 'Perfil actualizado correctamente', user });
  } catch (error) {
    next(error);
  }
};
