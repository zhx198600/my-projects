const express = require('express');
const { 
  getLaboratories, 
  getLaboratoryById, 
  createLaboratory, 
  updateLaboratory, 
  deleteLaboratory,
  getLaboratoryUsers,
  addUserToLaboratory,
  removeUserFromLaboratory
} = require('../controllers/laboratoryController');
const { authMiddleware } = require('../middleware/auth');
const { checkAnyRole, checkRole, ROLES } = require('../middleware/permissions');

const router = express.Router();

router.get('/', 
  authMiddleware,
  getLaboratories
);

router.get('/:id', 
  authMiddleware,
  getLaboratoryById
);

router.post('/', 
  authMiddleware, 
  checkRole(ROLES.SUPER_ADMIN),
  createLaboratory
);

router.put('/:id', 
  authMiddleware,
  updateLaboratory
);

router.delete('/:id', 
  authMiddleware, 
  checkRole(ROLES.SUPER_ADMIN),
  deleteLaboratory
);

router.get('/:id/users', 
  authMiddleware,
  getLaboratoryUsers
);

router.post('/:id/users', 
  authMiddleware,
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  addUserToLaboratory
);

router.delete('/:id/users/:user_id', 
  authMiddleware,
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  removeUserFromLaboratory
);

module.exports = router;
