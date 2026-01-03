const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { authMiddleware, requireAdminOrHR } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', departmentController.getAll);
router.get('/:id', departmentController.getById);
router.post('/', requireAdminOrHR, departmentController.create);
router.put('/:id', requireAdminOrHR, departmentController.update);
router.delete('/:id', requireAdminOrHR, departmentController.delete);

module.exports = router;
