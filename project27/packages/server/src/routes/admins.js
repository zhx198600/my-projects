const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.post('/login', adminController.login);
router.get('/', auth, adminController.getAllAdmins);
router.get('/:id', auth, adminController.getAdminById);
router.post('/', auth, adminController.createAdmin);
router.put('/:id', auth, adminController.updateAdmin);
router.delete('/:id', auth, adminController.deleteAdmin);

module.exports = router;
