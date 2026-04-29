const express = require('express');
const { 
  getLogs, 
  getLogById 
} = require('../controllers/logController');
const { authMiddleware } = require('../middleware/auth');
const { checkAnyRole, ROLES } = require('../middleware/permissions');

const router = express.Router();

router.get('/', 
  authMiddleware, 
  getLogs
);

router.get('/:id', 
  authMiddleware,
  getLogById
);

module.exports = router;
