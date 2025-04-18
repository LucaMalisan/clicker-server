import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Effect } from '../../model/effect.entity';
import { EffectDetail } from '../../model/effectDetail.entity';
import { UserPurchasedEffects } from '../../model/userPurchasedEffects.entity';
import { UserActiveEffects } from 'src/model/userActiveEffects.entity';

@Injectable()
export class EffectService {
  constructor(
    @InjectRepository(Effect) private readonly effectRepo: Repository<Effect>,
    @InjectRepository(UserPurchasedEffects) private readonly userPurchasedEffectRepo: Repository<UserPurchasedEffects>,
    @InjectRepository(UserActiveEffects) private readonly userActiveEffectRepo: Repository<UserActiveEffects>,
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
    return this.userPurchasedEffectRepo.findOne({
      where: {
        effectName: effectName,
        userUuid: userUuid,
      },
    });
  }

  async increaseLevelOrCreateEntry(effectName: string, userUuid: string) {
    let result = await this.userPurchasedEffectRepo
      .createQueryBuilder()
      .insert()
      .into(UserPurchasedEffects)
      .values({
        effectName: effectName,
        userUuid: userUuid,
        currentLevel: 1,
      })
      .onConflict(
        `("effectName", "userUuid") DO UPDATE SET "currentLevel" = "user_purchased_effects"."currentLevel" + 1`,
      )
      .setParameters({ incrementLevel: 'user_purchased_effects.currentLevel + 1' })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async findByUuid(userEffectUuid: string) {
    return this.userPurchasedEffectRepo.findOne({
      where: {
        uuid: userEffectUuid,
      },
    });
  }

  private userActiveEffectsBaseQuery() {
    return this.userActiveEffectRepo
      .createQueryBuilder()
      .select()
      .innerJoinAndSelect('UserActiveEffects.activatedBy', 'ab')
      .innerJoinAndSelect('UserActiveEffects.influencedUser', 'iu');
  }

  async getUserInfluencingEffects(userUuid: string) {
    return this.userActiveEffectsBaseQuery()
      .where('UserActiveEffects.influencedUserUuid = :userUuid', { userUuid: userUuid })
      .getMany();
  }

  async getEffectsActivatedBy(userUuid: string) {
    return this.userActiveEffectsBaseQuery()
      .where('UserActiveEffects.activatedByUuid = :userUuid and UserActiveEffects.influencedUserUuid != :userUuid', { userUuid: userUuid })
      .getMany();
  }
}