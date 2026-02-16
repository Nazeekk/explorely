import Database from '../index';
import Example from '../entities/Example';
import { BaseRepository } from './base';

export default class ExampleRepository extends BaseRepository<Example> {
  constructor(database: Database) {
    super(database, 'example');
  }
}
