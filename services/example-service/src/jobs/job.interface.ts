export default interface IJob {
  name: string;
  cronExpression: string;
  execute(): Promise<void>;
}
