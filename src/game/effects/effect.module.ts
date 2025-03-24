// effects/effects.module.ts
import { Module } from '@nestjs/common';
import { Effect } from './effect';
import { AsyncGenEffect } from './async-gen-effect';
import { EffectManager } from './effect-manager';
import { ButtonClickEffect } from './button-click-effect';
import { GameSessionService } from '../game-session.service';
import { GameSessionModule } from '../game-session.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../../config/config.service';
import { GameSession } from '../../model/gameSession.entity';
import { UserGameSession } from '../../model/userGameSession.entity';

const effects = [AsyncGenEffect, ButtonClickEffect]; // Liste aller Effekte

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([GameSession, UserGameSession]),
  ],
  providers: [
    ...effects,
    {
      provide: 'EFFECTS',
      useFactory: (...effects: Effect[]) => effects,
      inject: effects,
    },
    EffectManager,
    GameSessionService,
  ],
  exports: [EffectManager],
})

export class EffectsModule {
}