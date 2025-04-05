import { Socket } from 'socket.io';
import { UserEffect } from '../model/userEffect.entity';

//TODO change to singleton

export class Variables {

  public static sockets: Map<String, Socket> = new Map();

  public static userEffectIntervals: Map<UserEffect, NodeJS.Timeout> = new Map();

  public static getUserUuidBySocket(socket: Socket): String {
    for (let [key, value] of this.sockets.entries()) {
      if (value === socket) {
        return key;
      }
    }
    return '';
  }
}


