import { Injectable } from '@nestjs/common';
import { Effect } from '../../model/effect.entity';
import { EffectService } from './effect.service';
import { UserEffect } from '../../model/userEffect.entity';
import { Variables } from '../../static/variables';
import { UserGameSession } from '../../model/userGameSession.entity';
import { GameSessionService } from '../game-session.service';

interface IEffect {
  name: string,
  description: string,
  cost: string,
  route: string
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
      let cost = this.calculatePrice(effect, userEffect);

      effectJSON.push({
        name: effect.name,
        description: effect.description,
        cost: cost + '',
        route: effect.activationRoute,
      });
    }

    return JSON.stringify(effectJSON);
  }

  calculatePrice(effect: Effect, userEffect: UserEffect | null) {
    let currentLevel = userEffect ? userEffect.currentLevel : 0;
    console.log(`price: ${effect.startPrice}*${effect.priceIncrease}^${currentLevel}`);
    return effect.startPrice * ((effect.priceIncrease) ** (currentLevel));
  }

  calculateEfficiency(userEffect: UserEffect) {
    let currentLevel = userEffect.currentLevel;
    let effect = userEffect.effect;
    console.log(userEffect)
    console.log(`efficiency: ${effect.startEfficiency}*${effect.efficiencyIncrease}^${currentLevel-1}`);
    return effect.startEfficiency * ((effect.efficiencyIncrease) ** (currentLevel - 1));
  }

  async updateDatabase(userGameSession: UserGameSession, effect: Effect, userEffect: UserEffect | null) {
    userGameSession.points -= this.calculatePrice(effect, userEffect);
    await this.gameSessionService.saveUserGameSession(userGameSession);
    return this.effectService.increaseLevelOrCreateEntry(effect.name, userGameSession.userUuid + '');
  }

  clearOldInterval(userEffect: UserEffect) {
    let oldInterval = Variables.userEffectIntervals.get(userEffect);
    clearInterval(oldInterval);
  }
}