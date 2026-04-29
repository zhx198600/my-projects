const express = require('express');
const { exportToExcel, exportToCsv } = require('../controllers/exportController');
const { authMiddleware } = require('../middleware/auth');
const { checkAnyRole, ROLES } = require('../middleware/permissions');

const exportRouter = express.Router();

exportRouter.get('/equipment/excel', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  exportToExcel
);

exportRouter.get('/equipment/csv', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  exportToCsv
);

module.exports = exportRouter;
