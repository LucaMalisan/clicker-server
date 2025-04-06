import { Injectable } from '@nestjs/common';
import { EffectService } from './effect.service';
import { UserEffect } from '../../model/userEffect.entity';
import { Variables } from '../../static/variables';
import { GameSessionService } from '../game-session.service';

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

  async getEffects(userUuid: string) {
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

  async updateDatabase(effectName: string, userUuid: string, userEffect: UserEffect | null): Promise<UserEffect | null> {
    let effect = await this.effectService.findByName(effectName);
    let userGameSession = await this.gameSessionService.findOneByUserUuid(userUuid);

    if (!userGameSession) {
      throw new Error('could not find user game session');
    }

    if (!effect) {
      throw new Error('could not find effect');
    }
    if (!effect) {
      throw new Error('effect could not be found');
    }

    let currentLevel = this.getCurrentLevel(userEffect);
    let price = await this.effectService.getPriceOfEffectLevel(effect.name, currentLevel + 1);
    userGameSession.points -= (price ?? 0);

    await this.gameSessionService.saveUserGameSession(userGameSession);
    let newEntry = await this.effectService.increaseLevelOrCreateEntry(effect.name, userGameSession.userUuid + '');
    return this.effectService.findByUuid(newEntry.uuid);
  }

  clearOldInterval(userEffect: UserEffect) {
    let oldInterval = Variables.userEffectIntervals.get(userEffect.uuid);
    clearInterval(oldInterval);
  }

  public getCurrentLevel(userEffect: UserEffect | null) {
    return userEffect?.currentLevel ?? 0;
  }
}