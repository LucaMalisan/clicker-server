import { Module } from '@nestjs/common';
import { GameSessionService } from './game-session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../config/config.service';
import { GameSession } from '../model/gameSession.entity';
import { GameSessionGateway } from './game-session.gateway';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([GameSession]),
  ],
  providers: [GameSessionService, GameSessionGateway],
  exports: [GameSessionService],
})

export class GameSessionModule {
}
