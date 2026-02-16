import IJob from './job.interface';

export default class ExampleJob implements IJob {
  name = 'Example Job';
  cronExpression = '0 0 * * *';

  async execute(): Promise<void> {
    console.info('Running example job...');
  }
}
