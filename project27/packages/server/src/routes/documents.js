const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { upload, handleUploadError } = require('../middleware/upload');
const auth = require('../middleware/auth');

router.post('/upload', auth, upload.single('file'), handleUploadError, documentController.uploadFile);
router.get('/search', documentController.searchDocuments);
router.get('/', documentController.getAllDocuments);
router.get('/:id', documentController.getDocumentById);
router.post('/', auth, documentController.createDocument);
router.put('/:id', auth, documentController.updateDocument);
router.delete('/:id', auth, documentController.deleteDocument);

module.exports = router;
