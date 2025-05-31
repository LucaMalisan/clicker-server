export class TotalCollectedMethod implements IEvaluationMethod {

  /**
   * Only add points, don't subtract any
   * @param change
   * @param userGameSession
   */
  updatePoints(change: number, userGameSession: UserGameSession): number {
    return userGameSession.points + Math.max(0, change);
  }

  getDescription(): string {
    return 'Total gesammelte Viren';
  }
}