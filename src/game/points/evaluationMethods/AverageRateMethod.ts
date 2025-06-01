import { SessionTimer } from '../../SessionTimer';
import { UserGameSession } from '../../../model/userGameSession.entity';
import { IEvaluationMethod } from './IEvaluationMethod';

export class AverageRateMethod implements IEvaluationMethod {

  /**
   * Calculation of average points per second
   * @param change
   * @param userGameSession
   */
  updatePoints(change: number, userGameSession: UserGameSession): number {
    let elapsedTime = SessionTimer.getElapsedTime(userGameSession.gameSession) - userGameSession.updatedAt.getMilliseconds();
    return Math.round(userGameSession.totalCollected / (elapsedTime / 1000));
  }

  getDescription(): string {
    return 'Durchschnittliche Viren / Sekunde';
  }
}