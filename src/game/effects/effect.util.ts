import { Injectable } from '@nestjs/common';
import { EffectService } from './effect.service';
import { Variables } from '../../static/variables';
import { GameSessionService } from '../game-session.service';
import { UserPurchasedEffects } from '../../model/userPurchasedEffects.entity';

interface IEffect {
  name: string,
  description: string,
  cost: string,
  route: string,
  icon: string
}

@Injectable()
export class EffectUtil {

  constructor(private effectService: EffectService,
              private gameSessionService: GameSessionService) {

  }

  async getAvailableEffects(userUuid: string) {
    let effects = await this.effectService.findAll();
    let effectJSON: IEffect[] = [];

    for (let effect of effects) {
      let userEffect = await this.effectService.findByEffectName(effect.name, userUuid);
      let currentLevel = this.getCurrentLevel(userEffect);

      if (currentLevel >= effect.maxLevel) {
        continue;
      }

      let cost = await this.effectService.getPriceOfEffectLevel(effect.name, currentLevel + 1);

      effectJSON.push({
        name: effect.name,
        description: effect.description,
        cost: cost + '',
        route: effect.activationRoute,
        icon: effect.googleIcon,
      });
    }

    return JSON.stringify(effectJSON);
  }

  async updateDatabase(effectName: string, createdByUserUuid: string, influencedUserUuid: string, userEffect: UserPurchasedEffects | null): Promise<UserPurchasedEffects | null> {
    let effect = await this.effectService.findByName(effectName);
    if (!effect) {
      throw new Error('could not find effect');
    }
    if (!effect) {
      throw new Error('effect could not be found');
    }

    let currentLevel = this.getCurrentLevel(userEffect);
    let price = await this.effectService.getPriceOfEffectLevel(effect.name, currentLevel + 1);
    this.gameSessionService.updatePoints(createdByUserUuid, (-1*(price ?? 0)));
    await this.effectService.createEffectLogEntry(effectName, createdByUserUuid, influencedUserUuid);
    return this.effectService.increaseLevelOrCreateEntry(effect.name, createdByUserUuid);
  }

  clearOldInterval(userEffect: UserPurchasedEffects) {
    let oldInterval = Variables.userEffectIntervals.get(userEffect.uuid);
    clearInterval(oldInterval);
  }

  public getCurrentLevel(userEffect: UserPurchasedEffects | null) {
    return userEffect?.currentLevel ?? 0;
  }
}