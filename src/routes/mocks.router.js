import { Router } from 'express';
import mocksController from '../controllers/mocks.controller.js';

const router = Router();

router.get('/mockingpets', mocksController.getMockingPets);
router.get('/mockingusers', mocksController.getMockingUsers);
router.post('/generateData', mocksController.generateData);

export default router;
