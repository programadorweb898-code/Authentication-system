import { getUsersService, getAuditService } from '../../../factory.js';

export const getMe = async (req, res, next) => {
  try {
    const usersService = await getUsersService();
    const user = await usersService.getUserById(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const getStatsController = async (req, res, next) => {
  try {
    const usersService = await getUsersService();
    const stats = await usersService.getUserStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

export const getAllUsersController = async (req, res, next) => {
  try {
    const usersService = await getUsersService();
    const { startDate, endDate, sortOrder } = req.query;
    const users = await usersService.getAllUsers({ startDate, endDate, sortOrder });
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

export const getUserController = async (req, res, next) => {
  try {
    const usersService = await getUsersService();
    const user = await usersService.getUserById(req.params.id);
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
    const [usersService, auditService] = await Promise.all([
      getUsersService(),
      getAuditService(),
    ]);
    await usersService.deleteUser(req.params.id);
    await auditService.logAdminAction(req.user.id, 'DELETE_USER', req.params.id);
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

export const blockUserController = async (req, res, next) => {
  try {
    const [usersService, auditService] = await Promise.all([
      getUsersService(),
      getAuditService(),
    ]);
    const { isBlocked } = req.body;
    const user = await usersService.blockUser(req.params.id, isBlocked);
    await auditService.logAdminAction(req.user.id, isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER', req.params.id);
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
    const [usersService, auditService] = await Promise.all([
      getUsersService(),
      getAuditService(),
    ]);
    const { isVerified } = req.body;
    const user = await usersService.verifyUserManual(req.params.id, isVerified);
    await auditService.logAdminAction(req.user.id, isVerified ? 'VERIFY_USER' : 'UNVERIFY_USER', req.params.id);
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
    const usersService = await getUsersService();
    const user = await usersService.updateUser(req.user.id, req.body);
    res.status(200).json({ message: 'Perfil actualizado correctamente', user });
  } catch (error) {
    next(error);
  }
};
