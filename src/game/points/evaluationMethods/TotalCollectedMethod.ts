import { UserGameSession } from '../../../model/userGameSession.entity';
import { IEvaluationMethod } from './IEvaluationMethod';

export class TotalCollectedMethod implements IEvaluationMethod {

  /**
   * No specific logic, just use totalCollected points
   * @param change
   * @param userGameSession
   */
  updatePoints(change: number, userGameSession: UserGameSession): number {
    return userGameSession.totalCollected;
  }

  getDescription(): string {
    return 'Total gesammelte Viren';
  }
}