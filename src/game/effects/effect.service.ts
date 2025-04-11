import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Effect } from '../../model/effect.entity';
import { UserEffect } from '../../model/userEffect.entity';
import { EffectDetail } from '../../model/effectDetail.entity';

@Injectable()
export class EffectService {
  constructor(
    @InjectRepository(Effect) private readonly effectRepo: Repository<Effect>,
    @InjectRepository(UserEffect) private readonly userEffectRepo: Repository<UserEffect>,
    @InjectRepository(EffectDetail) private readonly effectDetailRepo: Repository<EffectDetail>,
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

  async getLevelDetailEntry(effectName: string, level: number) {
    return this.effectDetailRepo.findOne({
      where: {
        effectName: effectName,
        level: level,
      },
    });
  }

  async getPriceOfEffectLevel(effectName: string, level: number) {
    let entry = await this.getLevelDetailEntry(effectName, level);
    return entry?.price;
  }

  async getEfficiencyOfEffectLevel(effectName: string, level: number) {
    let entry = await this.getLevelDetailEntry(effectName, level);
    return entry?.efficiency;
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
    let payload = {
      effectName: effectName,
      userUuid: userUuid,
      currentLevel: 1,
    };

    let result = await this.userEffectRepo
      .createQueryBuilder()
      .insert()
      .into(UserEffect)
      .values(payload)
      .orUpdate([], ['effectName', 'userUuid'])
      .setParameter('incrementLevel', 'user_effect.currentLevel + 1')
      .returning('*')
      .updateEntity(false)
      .execute();

    return result.raw[0];
  }

  async findByUuid(userEffectUuid: string) {
    return this.userEffectRepo.findOne({
      where: {
        uuid: userEffectUuid,
      },
    });
  }
}