import { Injectable } from '@nestjs/common';
import { GameSessionService } from '../game-session.service';
import { Variables } from '../../static/variables';

/**
 * This method asynchronously sends the updated points of a player in regular intervals to the client
 */

@Injectable()
export class GamePointsActor {

  constructor(private gameSessionService: GameSessionService) {
    setInterval(() => this.sendUpdatedPoints(), 500);
  }

  protected async sendUpdatedPoints() {
    let activeGameSessions = await this.gameSessionService.findActive();
    activeGameSessions = activeGameSessions ? activeGameSessions : [];

    for (let gameSession of activeGameSessions) {

      //send the points of each user game session to the corresponding user
      let userGameSessions = await this.gameSessionService.findAssignedUsers(gameSession.uuid);
      userGameSessions = userGameSessions ? userGameSessions : [];

      for (let userGameSession of userGameSessions) {
        Variables.sockets.get(userGameSession.userUuid + '')?.emit('points', userGameSession.balance ? userGameSession.balance : 0 );
      }
    }
  }
}