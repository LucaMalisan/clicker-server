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
import { UserEffect } from '../../model/userEffect.entity';
import { EffectUtil } from './effect.util';
import { EffectDetail } from '../../model/effectDetail.entity';
import { CriticalHitEffect } from './single-effects/critical-hit-effect';
import { ReplicationEffect } from './single-effects/replication-effect.service';

const effects = [AsyncGenEffect, ButtonClickEffect, CriticalHitEffect, ReplicationEffect]; // Liste aller Effekte

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([GameSession, UserGameSession, Effect, UserEffect, EffectDetail]),
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
    EffectService,
    EffectUtil,
  ],
  exports: [EffectManager, EffectGateway, EffectUtil],
})

export class EffectsModule {
}