import { Socket } from 'socket.io';

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
}


