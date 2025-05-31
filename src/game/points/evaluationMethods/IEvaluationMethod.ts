import { UserGameSession } from '../../../model/userGameSession.entity';

interface IEvaluationMethod {

  updatePoints(change: number, userGameSession:UserGameSession): number;

  getDescription(): string
}