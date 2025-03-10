import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../config/config.service';
import { UserGameSession } from '../model/userGameSession.entity';
import { UserGameSessionService } from './user-game-session.service';
import { UserGameSessionGateway } from './user-game-session.gateway';
import { UsersModule } from '../users/users.module';
import { GameSessionModule } from '../game-session/game-session.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([UserGameSession]),
    UsersModule,
    GameSessionModule
  ],
  providers: [UserGameSessionService, UserGameSessionGateway],
  exports: [UserGameSessionService],
})
export class UserGameSessionModule {
}
