import { UserGameSession } from '../../../model/userGameSession.entity';

export interface IEvaluationMethod {

  updatePoints(change: number, userGameSession:UserGameSession): number;

  getDescription(): string
}