import { Socket } from 'socket.io';
import { CurrentBalanceMethod } from '../game/points/evaluationMethods/CurrentBalanceMethod';
import { TotalCollectedMethod } from '../game/points/evaluationMethods/TotalCollectedMethod';
import { AverageRateMethod } from '../game/points/evaluationMethods/AverageRateMethod';

/**
 * Contains caches for user sockets and timeouts
 */

export class Variables {

  //userUuid - Socket
  public static sockets: Map<String, Socket> = new Map();

  //userPurchasedEffect.uuid - Timeout
  public static userEffectIntervals: Map<String, NodeJS.Timeout> = new Map();

  //gameSessionUuid - Timeout
  public static sessionTimerIntervals: Map<String, NodeJS.Timeout> = new Map();

  public static getUserUuidBySocket(socket: Socket): String {
    for (let [key, value] of this.sockets.entries()) {
      if (value.id === socket.id) {
        return key;
      }
    }
    return '';
  }

  public static evaluationMethods = new Map<string, IEvaluationMethod>([
    ['currentBalance', new CurrentBalanceMethod()],
    ['totalCollected', new TotalCollectedMethod()],
    ['averageRate', new AverageRateMethod()],
  ]);

  public static getEvaluationMethods() {
    return Array.from(this.evaluationMethods, ([name, value]) => name);
  }
}


