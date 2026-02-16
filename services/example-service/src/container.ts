import { config } from './config';
import ExampleRepository from './database/repositories/example';
import ExampleService from './services/example';
import ExampleController from './controllers/example';
import RabbitMQService from './services/rabbitmq';
import Database from './database';
import ExampleConsumer from './consumers/example';
import ExampleJob from './jobs/example.job';

class Container {
  public readonly database: Database;
  public readonly rabbitMQService: RabbitMQService;
  public readonly exampleRepository: ExampleRepository;
  public readonly exampleService: ExampleService;
  public readonly exampleController: ExampleController;
  public readonly exampleConsumer: ExampleConsumer;
  public readonly exampleJob: ExampleJob;

  constructor() {
    this.database = new Database(config.database);
    this.rabbitMQService = new RabbitMQService(config.rabbitmq.url);

    this.exampleRepository = new ExampleRepository(this.database);
    this.exampleService = new ExampleService(this.exampleRepository);
    this.exampleController = new ExampleController(this.exampleService);

    this.exampleConsumer = new ExampleConsumer(this.rabbitMQService, this.exampleService);

    this.exampleJob = new ExampleJob();
  }
}

export const container = new Container();
