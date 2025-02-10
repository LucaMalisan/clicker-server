import { Injectable } from '@nestjs/common';
import { TestEntity } from './model/test.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(TestEntity) private readonly repo: Repository<TestEntity>,
  ) {}

  getHello(): string {
    const test = new TestEntity();
    test.someText = 'something lol';
    this.repo.save(test).catch((e) => console.log(e));
    return 'Hello World!';
  }
}
