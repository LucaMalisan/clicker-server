import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Variables } from '../static/variables';
import { Socket } from 'socket.io';
import { GameSessionService } from './game-session.service';
import { GameSession } from '../model/gameSession.entity';
import * as crypto from 'node:crypto';
import { EffectService } from './effects/effect.service';
import { UsersService } from '../users/users.service';

interface ISessionInfo {
  sessionKey: string,
  started: boolean,
  joinedPlayers: any[]
  admin: boolean
}

/**
 * This class handles the client-side game session through websocket routes
 */

@WebSocketGateway({ cors: { origin: '*' } })
export class GameSessionGateway {

  constructor(private gameSessionService: GameSessionService,
              private effectService: EffectService) {
  }

  /**
   * Session is created and persisted to database, mapped to the corresponding user
   * Client receives a confirmation
   * @param client
   * @param duration
   */

  @SubscribeMessage('create-session') async handleSessionCreation(@ConnectedSocket() client: Socket, @MessageBody() duration: string): Promise<void> {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('user uuid could not be found');
      }

      let parsedDuration = parseInt(duration);

      if (parsedDuration <= 0 || isNaN(parsedDuration) || !Number.isInteger(parsedDuration)) {
        throw new Error('Duration must be greater than 0');
      }

      //game sessions are identified by a random hex code
      //creates new game sesssion on db
      let gameSession = await this.gameSessionService.create({
        createdByUuid: userUuid,
        duration: parsedDuration * 60 * 1000,
        hexCode: `#${crypto.randomBytes(4).toString('hex')}`,
      });

      console.log('created game session: ' + gameSession.hexCode);

      // we use a new, dedicated message for the success message
      // error message are sent to the client as request response
      client.emit('session-creation-successful', gameSession.hexCode);
    } catch (err) {
      console.error(`Caught error: ${err}`);
      return err.message;
    }
  }

  /**
   * Admin (=creator of the game session) calls this route to indicate that the session should be started
   * @param client
   * @param key
   */

  @SubscribeMessage('ready-for-game-start')
  async getConfirmationForGameStart(@ConnectedSocket() client: Socket, @MessageBody() key: string): Promise<void> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;

    try {
      if (!userUuid) {
        throw new Error('user uuid could not be read');
      }

      let userGameSession = await this.gameSessionService.findOneByUserUuidAndKey(userUuid, key);
      let gameSession = userGameSession?.gameSession;

      if (!userGameSession) {
        throw new Error('user is not assigned to this game session');
      }

      if (gameSession?.createdByUuid !== userUuid) {
        throw new Error('user is not the creator of this game session');
      }

      if (!gameSession) {
        throw new Error('could not find gameSession');
      }

      if (!gameSession.startedAt) {
        //game session is marked as "started" in database
        gameSession.startedAt = new Date(Date.now());
        await this.gameSessionService.save(gameSession);
      }

      //indicate to all clients that the game starts
      for (let socket of Variables.sockets.values()) {
        socket.emit('start-game');
      }

      //init session timer
      Variables.sessionTimerIntervals.set(gameSession.uuid, setTimeout(async () => this.stopGameSession(gameSession), this.getRemainingDuration(gameSession)));
    } catch (err) {
      console.error(`caught error: ${err}`);
    }
  }

  /**
   * This route returns the current state of the server-side timer
   * @param client
   * @param key
   */
  @SubscribeMessage('get-remaining-duration')
  async handleGetRemainingDuration(@ConnectedSocket() client: Socket, @MessageBody() key): Promise<String> {
    let gameSession = await this.gameSessionService.findOneByKey(key);

    if (!gameSession) {
      throw new Error('could not find game session');
    }

    return this.getRemainingDuration(gameSession) + '';
  }

  protected getRemainingDuration(gameSession: GameSession): number {
    if (!gameSession || !gameSession.startedAt || !gameSession.duration) {
      return 0;
    }

    //total duration minus passed time since start = remaining time
    return gameSession.duration - (Date.now() - gameSession.startedAt.getTime());
  }

  protected async stopGameSession(gameSession: GameSession) {
    //stop session timer
    clearTimeout(Variables.sessionTimerIntervals.get(gameSession.uuid));

    for (let socket of Variables.sockets.values()) {
      //indicate to the client that the game ends
      socket.emit('stop-session', '');
    }

    //mark game session as finished on database
    gameSession.endedAt = new Date(Date.now());
    await this.gameSessionService.save(gameSession);

    //tables managing purchased and active effects are cleared after each round
    let assignedUsers = await this.gameSessionService.findAssignedUsers(gameSession.uuid);
    this.effectService.clearUserEffectTables(assignedUsers.map(e => e.userUuid ?? ''));

    //all effect intervals are cleared
    Variables.userEffectIntervals.forEach((interval, key) => {
      clearInterval(interval);
    });

    Promise.resolve();
  }

  /**
   * This route returns information about the current session
   * @param client
   * @param sessionKey
   */

  @SubscribeMessage('get-session-info')
  async handleGetSessionInfo(@ConnectedSocket() client: Socket, @MessageBody() sessionKey: string): Promise<string> {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('could not read user uuid');
      }

      let userGameSession = await this.gameSessionService.findOneByUserUuidAndKey(userUuid, sessionKey);

      if (!userGameSession) {
        throw new Error('could not find user game session');
      }

      let gameSession = await this.gameSessionService.findOneByUuid(userGameSession.gameSessionUuid);

      if (!gameSession) {
        throw new Error('could not find game session');
      }

      let assignedUsers = await this.gameSessionService.findAssignedUsers(gameSession.uuid);

      //we only send a session key if game session exists AND user is assigned to it
      //admin is the person who created the game session
      let response: ISessionInfo = {
        sessionKey: gameSession && userGameSession ? gameSession.hexCode : '',
        started: gameSession?.startedAt != null,
        joinedPlayers: assignedUsers.map(e => e.user?.userName),
        admin: gameSession?.createdByUuid === userUuid,
      };

      return JSON.stringify(response);
    } catch (err) {
      console.error(`Caught error: ${err}`);

      //something went wrong, we send an empty session key to indicate that session could be found
      let response: ISessionInfo = {
        sessionKey: '',
        started: false,
        joinedPlayers: [],
        admin: false,
      };

      return JSON.stringify(response);
    }
  }

  /**
   * This route is called by the client to indicate that the user wants to join an existing game session
   * @param client
   * @param key
   */

  @SubscribeMessage('join-session')
  async handleSessionJoining(@ConnectedSocket() client: Socket, @MessageBody() key: string) {
    let userUuid = Variables.getUserUuidBySocket(client) as string;

    try {
      if (!userUuid) {
        throw new Error('could not read user uuid');
      }

      let gameSession = await this.gameSessionService.findOneByKey(key);

      if (!gameSession) {
        throw new Error('could not find game session');
      }

      //the same user can only be assigned once to a game session
      let existingEntry = await this.gameSessionService.findOneByUserUuidAndKey(userUuid, key);

      if (existingEntry) {
        throw new Error('user is already assigned to this session');
      }

      //adds a new userGameSession entry on the db to persist the joining
      await this.gameSessionService.assignUserToSession(userUuid, gameSession.uuid);

      // if user joins a new game session where the old is still running, the effect tables are not cleared
      // we therefore remove all entries of the user
      this.effectService.clearUserEffectTables([userUuid]);

      //indicate successful join to client
      client.emit('join-successful', '');

      //indicate to all clients that a new player joined the game session
      let assignedUsers = await this.gameSessionService.findAssignedUsers(gameSession.uuid);
      let userNames = assignedUsers.map(e => e.user?.userName);

      for (let user of assignedUsers) {
        let socket = Variables.sockets.get(user.userUuid ?? '');
        socket?.emit('player-joined', JSON.stringify(userNames));
      }

    } catch (err) {
      console.error(`caught error: ${err}`);
      return err.message;
    }
  }
}