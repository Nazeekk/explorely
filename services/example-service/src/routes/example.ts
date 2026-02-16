import { Router } from 'express';
import { validate, exampleSchema } from '../middlewares/validation';
import { container } from '../container';

const { exampleController } = container;

const router = Router();

router.post('/', validate(exampleSchema), exampleController.create.bind(exampleController));
router.get('/', exampleController.getAll.bind(exampleController));
router.get('/:id', exampleController.getOne.bind(exampleController));

export default router;
