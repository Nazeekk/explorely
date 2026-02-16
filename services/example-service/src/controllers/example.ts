import { Request, Response, NextFunction } from 'express';
import ExampleService from '../services/example';

export default class ExampleController {
  constructor(private readonly service: ExampleService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const example = await this.service.create(req.body);
      res.status(201).json(example);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { example_text, example_integer, limit, offset } = req.query;

      const examples = await this.service.getAll({
        example_text: example_text ? String(example_text) : undefined,
        example_integer: example_integer ? Number(example_integer) : undefined,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      });

      res.json(examples);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const exampleId = parseInt(String(req.params.exampleId));
      const example = await this.service.getById(exampleId);
      res.json(example);
    } catch (error) {
      next(error);
    }
  }
}
