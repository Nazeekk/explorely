import amqp, { Channel, ChannelModel } from 'amqplib';

export default class RabbitMQService {
  constructor(private readonly url: string) {}

  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  async sendToQueue(queue: string, message: any): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel is not initialized');
    }

    await this.channel.assertQueue(queue, { durable: true });

    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  }

  async consume(queue: string, onMessage: (msg: any) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel is not initialized');
    }

    await this.channel.assertQueue(queue, { durable: true });

    this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await onMessage(content);

          this.channel?.ack(msg);
        } catch (error) {
          console.error(error);
          this.channel?.nack(msg);
        }
      }
    });
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        console.info('RabbitMQ Channel closed');
      }

      if (this.connection) {
        await this.connection.close();
        console.info('RabbitMQ Connection closed');
      }
    } catch (error: any) {
      if (error.message !== 'Connection closed: 320 (CONNECTION-FORCED)') {
        console.warn('⚠️ Warning while closing RabbitMQ:', error.message);
      }
    } finally {
      this.channel = null;
      this.connection = null;
    }
  }
}
