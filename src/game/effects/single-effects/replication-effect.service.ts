import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { UserGameSession } from '../../../model/userGameSession.entity';
import { GameSessionService } from '../../game-session.service';
import { EffectService } from '../effect.service';
import { EffectUtil } from '../effect.util';
import { ButtonClickEffect } from './button-click-effect';
import { AsyncGenEffect } from './async-gen-effect';
import { CriticalHitEffect } from './critical-hit-effect';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class ReplicationEffect extends AbstractEffect {

  protected static EFFECT_NAME = 'replication';
  protected collectedPoints: Map<String, number> = new Map();

  constructor(private gameSessionService: GameSessionService,
              private effectService: EffectService,
              private effectUtil: EffectUtil,
              private criticalHit: CriticalHitEffect,
              private autoclick: AsyncGenEffect) {
    super();
  }

  @SubscribeMessage('start-replication')
  public async execute(@ConnectedSocket() client: Socket) {
    try {
      console.log("hello hello")

      let userUuid = Variables.getUserUuidBySocket(client) as string;
      let userEffect = await this.effectService.findByEffectName(ReplicationEffect.EFFECT_NAME, userUuid);
      let newUserEffectEntry = await this.effectUtil.updateDatabase(ReplicationEffect.EFFECT_NAME, userUuid, userEffect);

      if (!newUserEffectEntry) {
        throw new Error('Couldn\'t create or update userEffect entry');
      }

      let callback = async (clicks: number, userUuid: string) => {
        console.log("registered clicks: " + clicks);
        let points = this.collectedPoints.get(userUuid) ?? 0;
        console.log("total clicks: " + clicks);
        this.collectedPoints.set(userUuid, points + clicks);
      };

      this.autoclick.subscribe(AsyncGenEffect.EVENT_NAME, (clicks: number) => callback(clicks, userUuid));
      this.criticalHit.subscribe(CriticalHitEffect.EVENT_NAME, (clicks: number) => callback(clicks, userUuid));

      setTimeout(async () => {
        console.log("timeout function called")
        let points = this.collectedPoints.get(userUuid) ?? 0;
        let effectDetailEntry = await this.effectService.getLevelDetailEntry(ReplicationEffect.EFFECT_NAME, newUserEffectEntry.currentLevel);
        let addPoints = points * ((effectDetailEntry?.efficiency ?? 1) - 1);

        this.gameSessionService.findOneByUserUuid(userUuid)
          .then((userGameSession: UserGameSession) => {
            userGameSession.points = (userGameSession.points == null) ? addPoints : userGameSession.points + addPoints;
            this.gameSessionService.saveUserGameSession(userGameSession);
          });

        this.autoclick.unsubscribe(AsyncGenEffect.EVENT_NAME, (clicks: number) => callback(clicks, userUuid));
        this.criticalHit.unsubscribe(ButtonClickEffect.EVENT_NAME, (clicks: number) => callback(clicks, userUuid));
      }, 10000);

      return this.effectUtil.getEffects(userUuid);

    } catch (err) {
      console.error(err);
    }
  }
}