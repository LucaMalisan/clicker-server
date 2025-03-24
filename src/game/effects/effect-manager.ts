import { Inject, Injectable } from '@nestjs/common';
import { Effect } from './effect';

@Injectable()
export class EffectManager {

  constructor(@Inject('EFFECTS') private readonly effects: Effect[]) {
    console.log('oijojreogjorea');
  }
}