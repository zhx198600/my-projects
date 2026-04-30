const express = require('express');
const { 
  getEquipment, 
  getEquipmentById, 
  createEquipment, 
  updateEquipment, 
  deleteEquipment, 
  borrowEquipment,
  returnEquipment,
  scrapEquipment,
  getBorrowRecords,
  getMyBorrowRecords
} = require('../controllers/equipmentController');
const { authMiddleware } = require('../middleware/auth');
const { checkAnyRole, ROLES } = require('../middleware/permissions');

const equipmentRouter = express.Router();
const borrowRecordsRouter = express.Router();

equipmentRouter.get('/', 
  authMiddleware, 
  getEquipment
);

equipmentRouter.get('/:id', 
  authMiddleware,
  getEquipmentById
);

equipmentRouter.post('/', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  createEquipment
);

equipmentRouter.put('/:id', 
  authMiddleware,
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  updateEquipment
);

equipmentRouter.delete('/:id', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  deleteEquipment
);

equipmentRouter.post('/:equipment_id/borrow', 
  authMiddleware,
  borrowEquipment
);

equipmentRouter.post('/:equipment_id/return', 
  authMiddleware,
  returnEquipment
);

equipmentRouter.post('/:equipment_id/scrap', 
  authMiddleware, 
  checkAnyRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]),
  scrapEquipment
);

borrowRecordsRouter.get('/my', 
  authMiddleware, 
  getMyBorrowRecords
);

borrowRecordsRouter.get('/', 
  authMiddleware, 
  getBorrowRecords
);

module.exports = {
  equipmentRouter,
  borrowRecordsRouter
};
