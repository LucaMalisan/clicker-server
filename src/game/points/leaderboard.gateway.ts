import { Variables } from '../../static/variables';
import { GameSessionService } from '../game-session.service';
import { UserGameSession } from '../../model/userGameSession.entity';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface ILeaderBoardEntry {
  userName: string,
  points: number
}

/**
 * This class handles the leaderboard through websocket routes and an actor
 */

@WebSocketGateway({ cors: { origin: '*' } })
export class LeaderboardGateway {

  constructor(private gameSessionService: GameSessionService) {
    //in-game leaderboard is updated in regular intervals through an actor
    setInterval(() => this.sendUpdatedLeaderboards(), 500);
  }

  /**
   * Gets the current leaderboard and sends it to all users of the game session
   */
  async sendUpdatedLeaderboards() {
    let activeGameSessions = await this.gameSessionService.findActive();
    activeGameSessions = activeGameSessions ? activeGameSessions : [];

    for (let gameSession of activeGameSessions) {
      let userGameSessions = await this.gameSessionService.findAssignedUsers(gameSession.uuid);
      userGameSessions = userGameSessions ?? [];
      let leaderBoardEntries = await this.generateLeaderboardFromGameSession(userGameSessions);

      userGameSessions
        .map(e => e.userUuid)
        .map((e: string) => Variables.sockets.get(e))
        .forEach(e => e?.emit('leaderboard', JSON.stringify(leaderBoardEntries)));
    }
  }

  /**
   * This method sends the end leaderboard to the client on his request
   * @param client
   * @param key
   */

  @SubscribeMessage('end-leaderboard')
  async sendEndLeaderboard(@ConnectedSocket() client: Socket, @MessageBody() key: string) {
    let gameSession = await this.gameSessionService.findOneByKey(key);

    //game session was not found or is still running
    if (!gameSession || gameSession.endedAt == null) {
      return '[]';
    }

    let userGameSession = await this.gameSessionService.findAssignedUsers(gameSession.uuid);
    let entries = await this.generateLeaderboardFromGameSession(userGameSession);
    return JSON.stringify(entries);
  }

  /**
   * This method contains the logic to generate the leaderboard from an array of userGameSessions
   * @param userGameSessions
   */
  async generateLeaderboardFromGameSession(userGameSessions: UserGameSession[]): Promise<ILeaderBoardEntry[]> {

    //user game sessions are sorted by points and mapped to DTOs
    return userGameSessions
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
  }
}