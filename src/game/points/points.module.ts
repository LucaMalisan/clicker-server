import { Module } from '@nestjs/common';
import { GamePointsActor } from './game-points.actor';
import { LeaderboardActor } from './leaderboard.actor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../../config/config.service';
import { GameSession } from '../../model/gameSession.entity';
import { UserGameSession } from '../../model/userGameSession.entity';
import { GameSessionService } from '../game-session.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([GameSession, UserGameSession]),
  ],
  providers: [
    GamePointsActor,
    LeaderboardActor,
    GameSessionService
  ],
  exports: [GamePointsActor, LeaderboardActor],
})

export class PointsModule {
}