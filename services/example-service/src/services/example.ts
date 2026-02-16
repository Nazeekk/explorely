import ExampleRepository from '../database/repositories/example';
import Example from '../database/entities/Example';

export interface ExampleFilters {
  example_text?: string;
  example_integer?: number;
  limit?: number;
  offset?: number;
}

export default class ExampleService {
  constructor(private readonly repository: ExampleRepository) {}

  async create(data: Example): Promise<Example> {
    return this.repository.create(data);
  }

  async getAll(filters: ExampleFilters = {}): Promise<Example[]> {
    return this.repository.find({
      where: {
        example_text: filters.example_text,
        example_integer: filters.example_integer,
      },
      limit: filters.limit,
      offset: filters.offset,
      orderBy: { created_at: 'DESC' },
    });
  }

  async getById(exampleId: number): Promise<Example> {
    const example = await this.repository.findById(exampleId, 'example_id');
    if (!example) {
      throw new Error('Example not found');
    }
    return example;
  }
}
