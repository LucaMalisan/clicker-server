import { Socket } from 'socket.io';

export class Variables {

  public static sockets: Map<Socket, String> = new Map();
}


