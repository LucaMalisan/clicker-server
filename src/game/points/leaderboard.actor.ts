import { Injectable } from '@nestjs/common';
import { Variables } from '../../static/variables';
import { GameSessionService } from '../game-session.service';

interface ILeaderBoardEntry {
  userName: string,
  points: number
}

@Injectable()
export class LeaderboardActor {

  constructor(private gameSessionService: GameSessionService) {
    setInterval(() => this.sendUpdatedLeaderboards(), 500);
  }

  async sendUpdatedLeaderboards() {
    let activeGameSessions = await this.gameSessionService.findActive();
    activeGameSessions = activeGameSessions ? activeGameSessions : [];

    for (let gameSession of activeGameSessions) {
      let userGameSessions = await this.gameSessionService.findBySessionUuid(gameSession.uuid);
      userGameSessions = userGameSessions ? userGameSessions : [];

      let leaderBoardEntries = userGameSessions
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

      userGameSessions
        .map(e => e.userUuid)
        .map((e: string) => Variables.sockets.get(e))
        .forEach(e => e?.emit('leaderboard', JSON.stringify(leaderBoardEntries)));
    }
  }
}