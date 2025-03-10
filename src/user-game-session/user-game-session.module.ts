import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../config/config.service';
import { UserGameSession } from '../model/userGameSession.entity';
import { UserGameSessionService } from './user-game-session.service';
import { UserGameSessionGateway } from './user-game-session.gateway';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([UserGameSession]),
  ],
  providers: [UserGameSessionService, UserGameSessionGateway],
  exports: [UserGameSessionService],
})
export class UserGameSessionModule {
}
