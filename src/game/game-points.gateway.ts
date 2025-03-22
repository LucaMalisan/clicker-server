import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameSessionService } from './game-session.service';
import { Variables } from '../static/variables';
import { UserGameSession } from '../model/userGameSession.entity';

interface ILeaderBoardEntry {
  userName: string,
  points: number
}

@WebSocketGateway({ cors: { origin: '*' } })
export class GamePointsGateway {

  constructor(private gameSessionService: GameSessionService) {
  }

  @SubscribeMessage('handle-button-clicks')
  handleSessionCreation(@ConnectedSocket() client: Socket, @MessageBody() clicks: string): void {
    let userUuid = Variables.getUserUuidBySocket(client) as string;

    try {
      if (!userUuid) {
        throw new Error('Could not read user uuid');
      }

      this.gameSessionService.findOneByUserUuid(userUuid)
        .then(async (userGameSession: UserGameSession) => {
          let factor = 1;
          let addPoints = parseInt(clicks) * factor;
          userGameSession.points = (userGameSession.points == null) ? addPoints : userGameSession.points + addPoints;
          await this.gameSessionService.saveUserGameSession(userGameSession);
          this.sendUpdatedLeaderboard(userGameSession);
          return userGameSession.points;
        });
    } catch (err) {
      console.error(err);
    }
  }

  async sendUpdatedLeaderboard(userGameSesison: UserGameSession) {
    return this.gameSessionService.findBySessionUuid(userGameSesison.gameSessionUuid)
      .then((userGameSessions: UserGameSession[]) => {
        let leaderBoard = userGameSessions
          .sort((a, b) => (a.points > b.points) ? -1 : 1)
          .map(e => {
            if (!e.user) {
              throw new Error('Could not find user');
            }

            let leaderBoardEntry: ILeaderBoardEntry = {
              userName: e.user.userName,
              points: e.points,
            };

            return leaderBoardEntry;
          });

        for (let socket of Variables.sockets.values()) {
          socket.emit('leaderboard', JSON.stringify(leaderBoard));
        }
      });
  }
}