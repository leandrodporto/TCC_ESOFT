import Router from 'express';
import { getRouters, getRouterById, calculateRouter, updateRouter, deleteRouter } from '../controllers/routers.controller.js';    

const router = Router();

router.get('/', getRouters);
router.get('/:id', getRouterById);
router.post('/', calculateRouter);
router.put('/:id', updateRouter);
router.delete('/:id', deleteRouter);


export default router;