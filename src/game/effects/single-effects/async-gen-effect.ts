import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { UserGameSession } from '../../../model/userGameSession.entity';
import { GameSessionService } from '../../game-session.service';
import { EffectService } from '../effect.service';
import { EffectUtil } from '../effect.util';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class AsyncGenEffect extends AbstractEffect {

  protected static EFFECT_NAME = 'autoclick';

  constructor(private gameSessionService: GameSessionService,
              private effectService: EffectService,
              private effectUtil: EffectUtil) {
    super();
  }

  @SubscribeMessage('start-auto-click')
  public async execute(@ConnectedSocket() client: Socket) {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;
      let userEffect = await this.effectService.findByEffectName(AsyncGenEffect.EFFECT_NAME, userUuid);
      let newEntry = await this.effectUtil.updateDatabase(AsyncGenEffect.EFFECT_NAME, userUuid, userEffect);

      if (userEffect) {
        this.effectUtil.clearOldInterval(userEffect);
      }

      if (!newEntry) {
        throw new Error('Couldn\'t create or update userEffect entry');
      }

      let efficiency = await this.effectService.getEfficiencyOfEffectLevel(newEntry.effectName, newEntry.currentLevel);

      let newInterval = setInterval(async () => {
        this.gameSessionService.findOneByUserUuid(userUuid)
          .then((userGameSession: UserGameSession) => {
            userGameSession.points += (efficiency ?? 0);
            this.gameSessionService.saveUserGameSession(userGameSession);
          });
      }, 1000);

      Variables.userEffectIntervals.set(newEntry, newInterval);

      return this.effectUtil.getEffects(userUuid);
    } catch (err) {
      console.error(err);
    }
  }
}