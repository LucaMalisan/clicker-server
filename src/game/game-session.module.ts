import { Module } from '@nestjs/common';
import { GameSessionService } from './game-session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../config/config.service';
import { GameSession } from '../model/gameSession.entity';
import { GameSessionGateway } from './game-session.gateway';
import { UsersModule } from '../users/users.module';
import { UserGameSession } from '../model/userGameSession.entity';
import { EffectsModule } from './effects/effect.module';
import { PointsModule } from './points/points.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([GameSession, UserGameSession]),
    UsersModule,
    GameSessionModule,
    EffectsModule,
    PointsModule,
  ],
  providers: [GameSessionService, GameSessionGateway],
  exports: [GameSessionService],
})

export class GameSessionModule {
}
