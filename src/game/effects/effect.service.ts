import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Effect } from '../../model/effect.entity';

@Injectable()
export class EffectService {
  constructor(
    @InjectRepository(Effect) private readonly effectRepo: Repository<Effect>,
  ) {
  }

  async findAll(): Promise<Effect[]> {
    return this.effectRepo.find();
  }
}