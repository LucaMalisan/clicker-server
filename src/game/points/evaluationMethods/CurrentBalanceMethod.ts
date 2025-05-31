export class CurrentBalanceMethod implements IEvaluationMethod {

  /**
   * No specific logic, just update the current balance
   * @param change
   */
  pointsToAdd(change: number): number {
    return change;
  }

  getDescription(): string {
    return "Aktuelle Anzahl Viren"
  }
}