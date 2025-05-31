export class TotalCollectedMethod implements IEvaluationMethod {

  /**
   * Only add points, don't subtract any
   * @param change
   */
  pointsToAdd(change: number): number {
    return Math.max(0, change);
  }

  getDescription(): string {
    return "Total gesammelte Viren"
  }
}