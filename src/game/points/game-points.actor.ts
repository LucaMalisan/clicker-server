import { Injectable } from '@nestjs/common';
import { GameSessionService } from '../game-session.service';
import { Variables } from '../../static/variables';

@Injectable()
export class GamePointsActor {

  constructor(private gameSessionService: GameSessionService) {
    setInterval(() => this.sendUpdatedPoints(), 500);
  }

  protected async sendUpdatedPoints() {
    let activeGameSessions = await this.gameSessionService.findActive();
    activeGameSessions = activeGameSessions ? activeGameSessions : [];

    for (let gameSession of activeGameSessions) {

      let userGameSessions = await this.gameSessionService.findBySessionUuid(gameSession.uuid);
      userGameSessions = userGameSessions ? userGameSessions : [];

      for (let userGameSession of userGameSessions) {
        Variables.sockets.get(userGameSession.userUuid + '')?.emit('points', userGameSession.points ? userGameSession.points : 0 );
      }
    }
  }
}