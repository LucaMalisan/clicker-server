import { Inject, Injectable } from '@nestjs/common';
import { AbstractEffect } from './abstract-effect';

@Injectable()
export class EffectManager {

  constructor(@Inject('EFFECTS') private readonly effects: AbstractEffect[]) {
  }
}