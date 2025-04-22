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
import { EffectService } from './effects/effect.service';
import { UserPurchasedEffects } from '../model/userPurchasedEffects.entity';
import { UserActiveEffects } from '../model/userActiveEffects.entity';
import { Effect } from '../model/effect.entity';
import { EffectDetail } from '../model/effectDetail.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([GameSession, UserGameSession, Effect, EffectDetail, UserPurchasedEffects, UserActiveEffects]),
    UsersModule,
    GameSessionModule,
    EffectsModule,
    PointsModule,
  ],
  providers: [GameSessionService, GameSessionGateway, EffectService],
  exports: [GameSessionService],
})

export class GameSessionModule {
}
