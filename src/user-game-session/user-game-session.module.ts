import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../config/config.service';
import { UserGameSession } from '../model/userGameSession.entity';
import { UserGameSessionService } from './user-game-session.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([UserGameSession]),
  ],
  providers: [UserGameSessionService],
  exports: [UserGameSessionService],
})
export class UserGameSessionModule {
}
