import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { UserGameSession } from '../../../model/userGameSession.entity';
import { GameSessionService } from '../../game-session.service';
import { EffectService } from '../effect.service';
import { EffectGateway } from '../effect.gateway';
import { EffectUtil } from '../effect.util';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class AsyncGenEffect extends AbstractEffect {

  constructor(private gameSessionService: GameSessionService,
              private effectService: EffectService,
              private effectUtil: EffectUtil) {
    super();
  }

  @SubscribeMessage('start-async-gen')
  public async execute(@ConnectedSocket() client: Socket) {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;
      let userEffect = await this.effectService.findByEffectName('Async generation', userUuid);
      let effect = await this.effectService.findByName('Async generation');
      let userGameSession = await this.gameSessionService.findOneByUserUuid(userUuid);

      if (!userGameSession) {
        throw new Error('could not find user game session');
      }

      if (!effect) {
        throw new Error('could not find effect');
      }

      let newEntry = await this.effectUtil.updateDatabase(userGameSession, effect, userEffect);

      if (userEffect) {
        this.effectUtil.clearOldInterval(userEffect);
      }

      if (!newEntry) {
        throw new Error('Couldn\'t create or update userEffect entry');
      }

      let efficiency = this.effectUtil.calculateEfficiency(newEntry);

      let newInterval = setInterval(async () => {
        this.gameSessionService.findOneByUserUuid(userUuid)
          .then((userGameSession: UserGameSession) => {
            userGameSession.points += efficiency;
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