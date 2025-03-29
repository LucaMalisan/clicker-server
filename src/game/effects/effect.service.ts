import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Effect } from '../../model/effect.entity';
import { UserEffect } from '../../model/userEffect.entity';

@Injectable()
export class EffectService {
  constructor(
    @InjectRepository(Effect) private readonly effectRepo: Repository<Effect>,
    @InjectRepository(UserEffect) private readonly userEffectRepo: Repository<UserEffect>,
  ) {
  }

  async findAll(): Promise<Effect[]> {
    return this.effectRepo.find();
  }

  async findByName(effectName: string) {
    return this.effectRepo.findOne({
      where: {
        name: effectName,
      },
    });
  }

  async findByEffectName(effectName: string, userUuid: string) {
    return this.userEffectRepo.findOne({
      where: {
        effectName: effectName,
        userUuid: userUuid,
      },
    });
  }

  async increaseLevelOrCreateEntry(effectName: string, userUuid: string) {
    let entry = await this.userEffectRepo.findOne({
      where: {
        effectName: effectName,
        userUuid: userUuid,
      },
    });

    if (entry) {
      entry.currentLevel += 1;
    } else {
      entry = new UserEffect();
      entry.effectName = effectName;
      entry.userUuid = userUuid;
      entry.currentLevel = 1;
    }
    return this.userEffectRepo.save(entry);
  }

  async findByUuid(userEffectUuid: string) {
    return this.userEffectRepo.findOne({
      where: {
        uuid: userEffectUuid,
      },
    });
  }
}