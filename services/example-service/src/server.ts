import app from './app';
import { config } from './config';
import { container } from './container';
import { Server } from 'node:http';
import cron from 'node-cron';

const {
  server: { port, host },
} = config;

let server: Server;

async function startServer() {
  try {
    await container.rabbitMQService.connect();
    await container.exampleConsumer.init();

    const jobs = [container.exampleJob];

    jobs.forEach((job) => {
      cron.schedule(job.cronExpression, async () => {
        console.info(`Starting job: ${job.name}`);
        try {
          await job.execute();
          console.info(`Job finished: ${job.name}`);
        } catch (error) {
          console.error(`Job failed: ${job.name}`, error);
        }
      });
      console.info(`Job scheduled: ${job.name} (${job.cronExpression})`);
    });

    server = app.listen(port, host, () => {
      console.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

startServer();

async function shutdown() {
  server.close(() => {
    console.info('Server closed');
  });

  try {
    await container.rabbitMQService.close();
    await container.database.close();

    console.info('Connections closed');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
