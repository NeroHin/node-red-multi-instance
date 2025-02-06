const express = require('express');
const router = express.Router();
const InstanceController = require('../controllers/InstanceController');

router.get('/', InstanceController.getAllInstances);
router.post('/', InstanceController.createInstance);
router.get('/:id', InstanceController.getInstance);
router.post('/:id/start', InstanceController.startInstance);
router.post('/:id/stop', InstanceController.stopInstance);
router.delete('/:id', InstanceController.deleteInstance);
router.get('/:id/logs', InstanceController.getInstanceLogs);
router.get('/:id/flows', InstanceController.getInstanceFlows);
router.get('/:id/nodes', InstanceController.getInstanceNodes);
router.get('/:id/settings', InstanceController.getInstanceSettings);

module.exports = router; 