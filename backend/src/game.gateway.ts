import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { randomUUID } from "crypto";

interface Room {
  roomId: string;
  players: string[];
  spectators: string[];
  ready: boolean[];
  pause: boolean[];
  playerPosition: number[];
  ballPosition: number[];
  ballDirection: number[];
  score: number[];
  custom: boolean[];
  start: boolean[];
  reload: boolean;
  finish: boolean;
}
@WebSocketGateway({
  namespace: "/game",
  cors: {
    origin: "*",
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("GameGateway");
  private rooms: Array<Room> = [];
  private users: Map<Socket, string> = new Map<Socket, string>();

  handleConnection(client: Socket, ...args: any[]) {}

  handleDisconnect(client: Socket) {
    if (this.findRoomIndex(client) === -1) {
      return;
    }
    if (this.isPlayerOne(client)) {
      this.rooms[this.findRoomIndex(client)].pause[0] = true;
    } else if (this.isPlayerTwo(client)) {
      this.rooms[this.findRoomIndex(client)].pause[1] = true;
    }
  }

  @SubscribeMessage("firstConnect")
  handleFirstConnect(client: Socket, userId: number) {
    if (this.isAlreadyConnected(userId)) {
      this.users.delete(this.isAlreadyConnected(userId));
    }
    this.users.set(client, userId.toString());
    this.reconnectRoom(client);
  }

  @SubscribeMessage("updateReadyServer")
  handleReady(client: Socket) {
    if (this.rooms.length === 0 || this.findAvailableRoom() === -1) {
      this.createRoom();
      this.rooms[this.rooms.length - 1].players[0] = this.users.get(client);
      this.roomReady(client)[0] = true;
    } else if (this.rooms[this.findAvailableRoom()].players[0] === "") {
      this.rooms[this.findAvailableRoom()].players[0] = this.users.get(client);
      this.roomReady(client)[0] = true;
    } else if (this.rooms[this.findAvailableRoom()].players[1] === "") {
      this.rooms[this.findAvailableRoom()].players[1] = this.users.get(client);
      this.roomReady(client)[1] = true;
    }
    client.join(this.roomId(client));
    if (this.roomIsFull(client)) {
      this.server.to(this.roomId(client)).emit("updateStartClient");
    }
  }

  @SubscribeMessage("endGameServer")
  handleEndGame(client: Socket): void {
    if (this.findRoomIndex(client) === -1) {
      this.server.to(client.id).emit("endGameClient");
      return;
    }
    if (this.isSpectator(client)) {
      this.server.to(client.id).emit("endGameClient");
      this.leaveRoom(client);
      return;
    }
    const param = {
      p1Id: +this.roomPlayers(client)[0],
      p2Id: +this.roomPlayers(client)[1],
      playerId: Number(this.users.get(client)),
    };
    this.server.to(this.roomId(client)).emit("endGameClient", param);
    this.leaveRoom(client);
  }

  @SubscribeMessage("updateDirectionServer")
  handleMessage(client: Socket, message: string): void {
    if (this.findRoomIndex(client) === -1) {
      return;
    }
    if (this.roomPause(client)) {
      return;
    }
    if (this.isPlayerOne(client)) {
      switch (message) {
        case "u": {
          this.server
            .to(this.roomId(client))
            .emit("updateDirectionClient", "u1");
          break;
        }
        case "d": {
          this.server
            .to(this.roomId(client))
            .emit("updateDirectionClient", "d1");
          break;
        }
        case "n": {
          this.server
            .to(this.roomId(client))
            .emit("updateDirectionClient", "n1");
          break;
        }
      }
    } else if (this.isPlayerTwo(client)) {
      switch (message) {
        case "u": {
          this.server
            .to(this.roomId(client))
            .emit("updateDirectionClient", "u2");
          break;
        }
        case "d": {
          this.server
            .to(this.roomId(client))
            .emit("updateDirectionClient", "d2");
          break;
        }
        case "n": {
          this.server
            .to(this.roomId(client))
            .emit("updateDirectionClient", "n2");
          break;
        }
      }
    }
  }

  @SubscribeMessage("updatePlayerPosServer")
  handleUpdatePlayerPos(
    client: Socket,
    param: { pos: number; id: number }
  ): void {
    if (this.findRoomIndex(client) === -1) {
      return;
    }
    if (this.roomPause(client)) {
      return;
    }
    if (this.isPlayerOne(client)) {
      if (param.id === 1) {
        this.roomPlayerPosition(client)[0] = param.pos;
      } else {
        this.roomPlayerPosition(client)[1] = param.pos;
      }
      this.server.to(this.roomId(client)).emit("updatePlayerPosClient", param);
    }
  }

  @SubscribeMessage("updateBallPosServer")
  handleUpdateBallPos(
    client: Socket,
    param: { posX: number; posY: number }
  ): void {
    if (this.findRoomIndex(client) === -1) {
      return;
    }
    if (this.roomPause(client)) {
      return;
    }
    if (this.isSpectator(client)) {
      return;
    }
    if (this.isPlayerOne(client)) {
      this.roomBallPosition(client)[0] = param.posX;
      this.roomBallPosition(client)[1] = param.posY;
      this.server.to(this.roomId(client)).emit("updateBallPosClient", param);
    }
  }

  @SubscribeMessage("updateBallDirServer")
  handleUpdateBallDirection(client: Socket, param: Array<number>): void {
    if (this.findRoomIndex(client) === -1) {
      return;
    }
    if (this.roomPause(client)) {
      return;
    }
    if (this.isSpectator(client)) {
      return;
    }
    if (this.isPlayerOne(client)) {
      this.roomBallDirection(client)[0] = param[0];
      this.roomBallDirection(client)[1] = param[1];
      this.server.to(this.roomId(client)).emit("updateBallDirClient", param);
    }
  }

  @SubscribeMessage("updateScoreServer")
  handleUpdateScore(
    client: Socket,
    param: { playerNumber: number; score: number }
  ): void {
    if (this.findRoomIndex(client) === -1) {
      return;
    }
    if (this.roomPause(client)) {
      return;
    }
    if (this.isSpectator(client)) {
      return;
    }
    if (this.isPlayerOne(client)) {
      if (param.playerNumber === 1) {
        this.roomScore(client)[0] = param.score;
      } else {
        this.roomScore(client)[1] = param.score;
      }
      this.server.to(this.roomId(client)).emit("updateScoreClient", param);
    }
  }

  @SubscribeMessage("updateCustomServer")
  handleUpdateCustom(client: Socket, customStatus: boolean): void {
    if (this.isSpectator(client)) {
      return;
    }
    if (this.isPlayerOne(client)) {
      this.roomCustom(client)[0] = customStatus;
    } else if (this.isPlayerTwo(client)) {
      this.roomCustom(client)[1] = customStatus;
    }
  }

  @SubscribeMessage("invitationGameServer")
  handleInvitationGame(client: Socket, id: string): void {
    if (this.findRoomById(id) === -1) {
      this.createRoom(id);
      this.rooms[this.findRoomById(id)].players[0] = this.users.get(client);
      this.roomReady(client)[0] = true;
    } else {
      this.rooms[this.findRoomById(id)].players[1] = this.users.get(client);
    }
    client.join(this.roomId(client));
    if (this.roomIsFull(client)) {
      this.server.to(this.roomId(client)).emit("updateStartClient");
      this.roomReady(client)[0] = true;
      this.roomReady(client)[1] = true;
    }
  }

  @SubscribeMessage("spectateGameServer")
  handleSpectateGame(client: Socket, id: string): void {
    let roomToSpectate = "";

    for (const room of this.rooms) {
      if (room.players[0] === id || room.players[1] === id) {
        roomToSpectate = room.roomId;
      }
    }
    this.rooms[this.findRoomById(roomToSpectate)].spectators.push(
      this.users.get(client)
    );
    client.join(roomToSpectate);
  }

  reconnectRoom(client: Socket): boolean {
    if (this.findRoomIndex(client) === -1) {
      return false;
    }
    let param = {
      ready: false,
      start: false,
      custom: false,
    };
    client.join(this.roomId(client));

    if (this.isPlayerOne(client) && this.roomReady(client)[0]) {
      param.ready = true;
    } else if (this.isPlayerTwo(client) && this.roomReady(client)[1]) {
      param.ready = true;
    } else if (this.isSpectator(client)) {
      param.ready = true;
    }

    if (this.roomIsFull(client)) {
      param.start = true;
      this.server.to(client.id).emit("updateAlreadyStarted");
    }

    if (this.isPlayerOne(client) && this.roomCustom(client)[0]) {
      param.custom = true;
    } else if (this.isPlayerTwo(client) && this.roomCustom(client)[1]) {
      param.custom = true;
    }
    this.server.to(client.id).emit("reconnectClient", param);
    this.reconnectGame(client);
    return true;
  }

  reconnectGame(client: Socket) {
    if (!this.roomBallPosition(client)[0]) {
      return;
    }
    const playerPosition: Array<number> = [...this.roomPlayerPosition(client)];
    const ballPosition: Array<number> = [...this.roomBallPosition(client)];
    const ballDirection: Array<number> = [...this.roomBallDirection(client)];
    const score: Array<number> = [...this.roomScore(client)];

    if (this.isPlayerOne(client)) {
      this.findRoom(client).pause[0] = false;
    } else if (this.isPlayerTwo(client)) {
      this.findRoom(client).pause[1] = false;
    }

    this.server
      .to(client.id)
      .emit("updatePlayerPosClient", { pos: playerPosition[0], id: 1 });
    this.server
      .to(client.id)
      .emit("updatePlayerPosClient", { pos: playerPosition[1], id: 2 });
    this.server.to(client.id).emit("updateBallPosClient", {
      posX: ballPosition[0],
      posY: ballPosition[1],
    });
    this.server.to(client.id).emit("updateBallDirClient", ballDirection);
    this.server
      .to(client.id)
      .emit("updateScoreClient", { playerNumber: 1, score: score[0] });
    this.server
      .to(client.id)
      .emit("updateScoreClient", { playerNumber: 2, score: score[1] });
    this.server.to(client.id).emit("reconnectStatusClient");
  }

  leaveRoom(client: Socket): void {
    if (this.findRoomIndex(client) === -1) {
      return;
    }
    client.leave(this.roomId(client));
    if (this.isSpectator(client)) {
      for (const room of this.rooms) {
        if (room.spectators.includes(this.users.get(client))) {
          room.spectators.splice(
            room.spectators.indexOf(this.users.get(client), 1)
          );
        }
      }
    } else {
      for (const room of this.rooms) {
        if (room.players.includes(this.users.get(client))) {
          this.rooms.splice(this.rooms.indexOf(room), 1);
        }
      }
    }
  }

  createRoom(id?: string): void {
    const newRoom: Room = {
      roomId: id ? id : randomUUID(),
      players: ["", ""],
      spectators: [],
      ready: [false, false],
      pause: [false, false],
      playerPosition: [],
      ballPosition: [],
      ballDirection: [],
      score: [0, 0],
      custom: [false, false],
      start: [false, false],
      reload: false,
      finish: false,
    };
    this.rooms.push(newRoom);
  }

  findRoomById(id: string): number {
    for (const room of this.rooms) {
      if (room.roomId === id) {
        return this.rooms.indexOf(room);
      }
    }
    return -1;
  }

  findAvailableRoom(): number {
    for (const room of this.rooms) {
      if (room.players[0] === "" || room.players[1] === "") {
        return this.rooms.indexOf(room);
      }
    }
    return -1;
  }

  findRoomIndex(client: Socket): number {
    for (const room of this.rooms) {
      if (
        room.players[0] === this.users.get(client) ||
        room.players[1] === this.users.get(client)
      ) {
        return this.rooms.indexOf(room);
      }
      for (const spectator of room.spectators) {
        if (spectator === this.users.get(client)) {
          return this.rooms.indexOf(room);
        }
      }
    }
    return -1;
  }

  findRoom(client: Socket): Room {
    return this.rooms[this.findRoomIndex(client)];
  }

  isAlreadyConnected(userId: number): Socket {
    for (const user of this.users) {
      if (user[1] === userId.toString()) {
        return user[0];
      }
    }
    return null;
  }

  isPlayerOne(client: Socket): boolean {
    if (this.findRoomIndex(client) === -1) {
      return;
    }
    if (this.findRoom(client).players[0] === this.users.get(client)) {
      return true;
    }
    return false;
  }

  isPlayerTwo(client: Socket): boolean {
    if (this.findRoomIndex(client) === -1) {
      return;
    }
    if (this.findRoom(client).players[1] === this.users.get(client)) {
      return true;
    }
    return false;
  }

  isSpectator(client: Socket): boolean {
    for (const room of this.rooms) {
      for (const spectator of room.spectators) {
        if (spectator === this.users.get(client)) {
          return true;
        }
      }
    }
    return false;
  }

  roomIsFull(client: Socket): boolean {
    if (
      this.roomPlayers(client)[0] !== "" &&
      this.roomPlayers(client)[1] !== ""
    ) {
      return true;
    }
    return false;
  }

  roomId(client: Socket): string {
    return this.findRoom(client).roomId;
  }

  roomPlayers(client: Socket): Array<string> {
    return this.findRoom(client).players;
  }

  roomReady(client: Socket): Array<boolean> {
    return this.findRoom(client).ready;
  }

  roomPlayerPosition(client: Socket): Array<number> {
    return this.findRoom(client).playerPosition;
  }

  roomBallPosition(client: Socket): Array<number> {
    return this.findRoom(client).ballPosition;
  }

  roomBallDirection(client: Socket): Array<number> {
    return this.findRoom(client).ballDirection;
  }

  roomScore(client: Socket): Array<number> {
    return this.findRoom(client).score;
  }

  roomCustom(client: Socket): Array<boolean> {
    return this.findRoom(client).custom;
  }

  roomPause(client: Socket): boolean {
    if (this.findRoom(client).pause[0] || this.findRoom(client).pause[1]) {
      return true;
    }
    return false;
  }

  roomStart(client: Socket): Array<boolean> {
    return this.findRoom(client).start;
  }
}
