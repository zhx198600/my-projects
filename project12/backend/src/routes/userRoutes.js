const express = require('express');
const { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  resetPassword 
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { checkAnyRole, checkRole, ROLES } = require('../middleware/permissions');

const router = express.Router();

router.get('/', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  getUsers
);

router.get('/:id', 
  authMiddleware,
  getUserById
);

router.post('/', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  createUser
);

router.put('/:id', 
  authMiddleware,
  updateUser
);

router.delete('/:id', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  deleteUser
);

router.post('/:id/reset-password', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  resetPassword
);

module.exports = router;
