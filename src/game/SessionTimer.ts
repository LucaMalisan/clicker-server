import { GameSession } from '../model/gameSession.entity';

export class SessionTimer {

  public static getRemainingDuration(gameSession: GameSession): number {
    if (!gameSession || !gameSession.startedAt || !gameSession.duration) {
      return 0;
    }

    //total duration minus passed time since start = remaining time
    return gameSession.duration - (Date.now() - gameSession.startedAt.getTime());
  }

  public static getElapsedTime(gameSession: GameSession) {
    if (!gameSession || !gameSession.startedAt || !gameSession.duration) {
      return 0;
    }

    //total duration minus passed time since start = remaining time
    return (Date.now() - gameSession.startedAt.getTime());
  }
}