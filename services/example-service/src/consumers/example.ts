import RabbitMQService from '../services/rabbitmq';
import ExampleService from '../services/example';

export default class ExampleConsumer {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly exampleService: ExampleService,
  ) {}

  async init() {
    await this.rabbitMQService.consume('example_created', async (msg) => {
      console.info(msg);

      /*
       * Потрібно для того щоб слухати подію з RabbitMQ
       * і при її отриманні виконувати якусь дію
       * Приклад використання
       * await this.exampleService.doSomething({ msg })
       */
    });
  }
}
