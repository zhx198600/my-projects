const express = require('express');
const { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCategoryTree
} = require('../controllers/categoryController');
const { authMiddleware } = require('../middleware/auth');
const { checkAnyRole, checkRole, ROLES } = require('../middleware/permissions');

const router = express.Router();

router.get('/tree', 
  authMiddleware,
  getCategoryTree
);

router.get('/:id', 
  authMiddleware,
  getCategoryById
);

router.get('/', 
  authMiddleware,
  getCategories
);

router.post('/', 
  authMiddleware,
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  createCategory
);

router.put('/:id', 
  authMiddleware,
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  updateCategory
);

router.delete('/:id', 
  authMiddleware,
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  deleteCategory
);

module.exports = router;
