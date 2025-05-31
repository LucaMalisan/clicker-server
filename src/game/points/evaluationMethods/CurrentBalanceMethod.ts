import { UserGameSession } from '../../../model/userGameSession.entity';
import { IEvaluationMethod } from './IEvaluationMethod';

export class CurrentBalanceMethod implements IEvaluationMethod {

  /**
   * No specific logic, just use the current balance
   * @param change
   * @param userGameSession
   */
  updatePoints(change: number, userGameSession: UserGameSession): number {
    return userGameSession.balance;
  }

  getDescription(): string {
    return "Aktuelle Anzahl Viren"
  }
}