const express = require('express');
const { 
  getRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole
} = require('../controllers/roleController');
const { 
  getPermissions, 
  getPermissionsByRole 
} = require('../controllers/permissionController');
const { authMiddleware } = require('../middleware/auth');
const { checkAnyRole, checkRole, ROLES } = require('../middleware/permissions');

const router = express.Router();

router.get('/', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  getRoles
);

router.get('/permissions', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  getPermissions
);

router.get('/:id', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  getRoleById
);

router.post('/', 
  authMiddleware, 
  checkRole(ROLES.SUPER_ADMIN),
  createRole
);

router.put('/:id', 
  authMiddleware, 
  checkRole(ROLES.SUPER_ADMIN),
  updateRole
);

router.delete('/:id', 
  authMiddleware, 
  checkRole(ROLES.SUPER_ADMIN),
  deleteRole
);

router.get('/:id/permissions', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  getPermissionsByRole
);

module.exports = router;
