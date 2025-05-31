export class CurrentBalanceMethod implements IEvaluationMethod {

  /**
   * No specific logic, just update the current balance
   * @param change
   * @param userGameSession
   */
  updatePoints(change: number, userGameSession: UserGameSession): number {
    return userGameSession.points + change;
  }

  getDescription(): string {
    return "Aktuelle Anzahl Viren"
  }
}