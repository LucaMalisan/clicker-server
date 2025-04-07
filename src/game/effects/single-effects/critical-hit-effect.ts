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

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class CriticalHitEffect extends AbstractEffect {

  protected static EFFECT_NAME = 'critical-hit';

  constructor(private gameSessionService: GameSessionService,
              private effectService: EffectService,
              private effectUtil: EffectUtil,
              private buttonClick: ButtonClickEffect) {
    super();
  }

  @SubscribeMessage('start-critical-hit')
  public async execute(@ConnectedSocket() client: Socket) {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;
      let userEffect = await this.effectService.findByEffectName(CriticalHitEffect.EFFECT_NAME, userUuid);
      let newUserEffectEntry = await this.effectUtil.updateDatabase(CriticalHitEffect.EFFECT_NAME, userUuid, userEffect);

      if (!newUserEffectEntry) {
        throw new Error('Couldn\'t create or update userEffect entry');
      }

      let effectDetailEntry = await this.effectService.getLevelDetailEntry(CriticalHitEffect.EFFECT_NAME, newUserEffectEntry.currentLevel);

      this.buttonClick.subscribe('handle-button-clicks', (clicks: string) => {
        let randomNumber = Math.random();

        if (randomNumber <= (effectDetailEntry?.probability ?? 0)) {
          let addPoints = parseInt(clicks) * ((effectDetailEntry?.efficiency ?? 1) - 1);

          this.gameSessionService.findOneByUserUuid(userUuid)
            .then((userGameSession: UserGameSession) => {
              userGameSession.points = (userGameSession.points == null) ? addPoints : userGameSession.points + addPoints;
              this.gameSessionService.saveUserGameSession(userGameSession);
            });
        }
      });
    } catch (err) {
      console.error(err);
    }
  }
}