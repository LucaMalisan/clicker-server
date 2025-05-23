import { Injectable } from '@nestjs/common';
import { Variables } from '../../static/variables';
import { GameSessionService } from '../game-session.service';
import { UserGameSession } from '../../model/userGameSession.entity';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface ILeaderBoardEntry {
  userName: string,
  points: number
}

@WebSocketGateway({ cors: { origin: '*' } })
export class LeaderboardGateway {

  constructor(private gameSessionService: GameSessionService) {
    setInterval(() => this.sendUpdatedLeaderboards(), 500);
  }

  async sendUpdatedLeaderboards() {
    let activeGameSessions = await this.gameSessionService.findActive();
    activeGameSessions = activeGameSessions ? activeGameSessions : [];

    for (let gameSession of activeGameSessions) {
      let userGameSessions = await this.gameSessionService.findBySessionUuid(gameSession.uuid);
      userGameSessions = userGameSessions ?? [];
      let leaderBoardEntries = this.generateLeaderboardFromGameSession(userGameSessions);

      userGameSessions
        .map(e => e.userUuid)
        .map((e: string) => Variables.sockets.get(e))
        .forEach(e => e?.emit('leaderboard', JSON.stringify(leaderBoardEntries)));
    }
  }

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

  async generateLeaderboardFromGameSession(userGameSessions: UserGameSession[]): Promise<ILeaderBoardEntry[]> {
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