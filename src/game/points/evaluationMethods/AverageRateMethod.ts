import { SessionTimer } from '../../SessionTimer';

export class AverageRateMethod implements IEvaluationMethod {

  /**
   * Only add points, don't subtract any
   * @param change
   * @param userGameSession
   */
  updatePoints(change: number, userGameSession: UserGameSession): number {
    let totalPoints = userGameSession.points + change;
    let elapsedTime = SessionTimer.getElapsedTime(gameSession)
    return Math.round(totalPoints / (elapsedTime / 1000));
  }

  getDescription(): string {
    return 'Durchschnittliche Viren / Sekunde';
  }
}