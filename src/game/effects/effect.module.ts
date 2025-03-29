// effects/effects.module.ts
import { Module } from '@nestjs/common';
import { AbstractEffect } from './abstract-effect';
import { AsyncGenEffect } from './single-effects/async-gen-effect';
import { EffectManager } from './effect-manager';
import { ButtonClickEffect } from './single-effects/button-click-effect';
import { GameSessionService } from '../game-session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../../config/config.service';
import { GameSession } from '../../model/gameSession.entity';
import { UserGameSession } from '../../model/userGameSession.entity';
import { EffectGateway } from './effect.gateway';
import { EffectService } from './effect.service';
import { Effect } from '../../model/effect.entity';

const effects = [AsyncGenEffect, ButtonClickEffect]; // Liste aller Effekte

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([GameSession, UserGameSession, Effect]),
  ],
  providers: [
    ...effects,
    EffectGateway,
    {
      provide: 'EFFECTS',
      useFactory: (...effects: AbstractEffect[]) => effects,
      inject: effects,
    },
    EffectManager,
    GameSessionService,
    EffectService
  ],
  exports: [EffectManager, EffectGateway],
})

export class EffectsModule {
}