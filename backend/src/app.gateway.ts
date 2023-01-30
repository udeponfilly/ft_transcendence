import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { randomUUID } from "crypto";
import { Socket, Server } from "socket.io";
import { UserService } from "./user/user.service";

interface userProfile {
  id: number;
  login?: string;
  username?: string;
  status?: string;
  avatar?: string;
}

interface userPair {
  id1: number;
  id2: number;
}

@WebSocketGateway({
  namespace: "/app",
  cors: {
    origin: "http://localhost:3001",
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private usersProfiles: userProfile[];
  private usersSockets: Map<Socket, number>;
  private usersInvited: Map<string, userPair>;
  constructor(private readonly userService: UserService) {
    this.usersSockets = new Map<Socket, number>();
    this.usersProfiles = [];
    this.usersInvited = new Map<string, userPair>();
    this.initUsersProfiles();
  }

  async initUsersProfiles() {
    let list = await this.userService.users({});
    let profile: userProfile;

    for (let user of list) {
      profile = {
        id: user.id,
        login: user.login,
        username: user.username,
        avatar: user.avatar,
        status: "offline",
      };
      this.usersProfiles.push(profile);
    }
  }

  @WebSocketServer() public server: Server;

  handleConnection(socket: Socket) {}

  isAlreadyConnected(userId: number): Socket {
    for (let [socket, id] of this.usersSockets) {
      if (id === userId) return socket;
    }
    return null;
  }

  /** Profiles */
  getProfile(id: number): userProfile {
    for (let profile of this.usersProfiles) {
      if (profile.id === id) return profile;
    }
  }

  setProfile(data: {
    id: number;
    username?: string;
    status?: string;
    avatar?: string;
  }) {
    let newProfile: userProfile;

    for (let i = 0; i < this.usersProfiles.length; i++) {
      if (this.usersProfiles[i].id === data.id) {
        newProfile = {
          id: this.usersProfiles[i].id,
          login: this.usersProfiles[i].login,
          username:
            data.username !== undefined
              ? data.username
              : this.usersProfiles[i].username,
          status:
            data.status !== undefined
              ? data.status
              : this.usersProfiles[i].status,
          avatar:
            data.avatar !== undefined
              ? data.avatar
              : this.usersProfiles[i].avatar,
        };
        this.usersProfiles.splice(i, 1);
        return this.usersProfiles.push(newProfile);
      }
    }
    return this.usersProfiles.push(data);
  }

  /** Connection */
  @SubscribeMessage("connection")
  handleInitTable(socket: Socket, data: userProfile) {
    const alreadyConnectedSocket = this.isAlreadyConnected(data.id);

    if (alreadyConnectedSocket)
      this.usersSockets.delete(alreadyConnectedSocket);
    this.usersSockets.set(socket, data.id);
    if (
      this.usersProfiles.find((userProfile) => userProfile.id === data.id) ===
      undefined
    )
      socket.emit("firstConnectionFromServer");
    let status = this.getProfile(this.usersSockets.get(socket))?.status;
    if (status && status !== "offline") 
      data.status = status;
    this.setProfile(data);
    this.server.emit("updateStatusFromServer", this.usersProfiles);
    this.server.emit("updateSearchBarUserList", this.usersProfiles);
    // so that socket signal received by search bar doesnt get mixed up as it is rendered everywhere
  }

  /** update to anything: online, offline, in game... */
  @SubscribeMessage("updateStatus")
  handleUpdateStatus(socket: Socket, status: string) {
    if (!this.usersSockets.get(socket)) return;
    this.setProfile({ id: this.usersSockets.get(socket), status: status });
    this.server.emit("updateStatusFromServer", this.usersProfiles);
    this.server.emit("updateSearchBarUserList", this.usersProfiles);
    this.server.to(socket.id).emit("updateStatusGame", status);
  }

  @SubscribeMessage("updateUsername")
  handleUpdateUsername(socket: Socket, username: string) {
    if (!this.usersSockets.get(socket)) return;
    this.setProfile({ id: this.usersSockets.get(socket), username: username });
    this.server.emit("updateStatusFromServer", this.usersProfiles);
    this.server.emit("updateSearchBarUserList", this.usersProfiles);
  }
  @SubscribeMessage("updateAvatar")
  handleUpdateAvatar(socket: Socket, avatar: string) {
    if (!this.usersSockets.get(socket)) return;
    this.setProfile({ id: this.usersSockets.get(socket), avatar: avatar });
    this.server.emit("updateStatusFromServer", this.usersProfiles);
    this.server.emit("updateSearchBarUserList", this.usersProfiles);
  }

  /** Game */
  @SubscribeMessage("invitePlayer")
  handleInvitePlayer(socket: Socket, invitedPlayerId: number) {
    for (let [sock, id] of this.usersSockets) {
      if (id === invitedPlayerId) {
        this.server.to(sock.id).emit("invitePlayerClient"); // check si le user est pas deja dans une invite
        this.server.to(socket.id).emit("hasInvitedClient");
        this.usersInvited.set(randomUUID(), {
          id1: this.usersSockets.get(socket),
          id2: id,
        });
        return;
      }
    }
  }

  @SubscribeMessage("acceptInvitationServer")
  handleAcceptInvitation(socket: Socket) {
    const socketId = this.usersSockets.get(socket);

    for (let [id, pair] of this.usersInvited) {
      if (pair.id1 === socketId || pair.id2 === socketId) {
        for (let [sock, sockId] of this.usersSockets) {
          if (sockId === pair.id1 || sockId === pair.id2) {
            this.server.to(sock.id).emit("invitationGameClient", id);
          }
        }
      }
    }
  }

  @SubscribeMessage("declineInvitationServer")
  handleDeclineInvitation(socket: Socket) {
    const socketId = this.usersSockets.get(socket);
    let invitingPlayerId: number;

    for (let [id, pair] of this.usersInvited) {
      if (pair.id1 === socketId || pair.id2 === socketId) {
        for (let [sock, sockId] of this.usersSockets) {
          if (sockId === pair.id1 || sockId === pair.id2) {
            invitingPlayerId = pair.id1;
            for (let [sock2, sockId] of this.usersSockets) {
              if (invitingPlayerId === sockId) {
                socket.to(sock2.id).emit("declineInvitationClient");
              }
            }
          }
        }
      }
    }
  }

  @SubscribeMessage("deleteInvitation")
  handleDeleteInvitation(socket: Socket) {
    const socketId = this.usersSockets.get(socket);
    for (let [id, pair] of this.usersInvited) {
      if (pair.id1 === socketId || pair.id2 === socketId) {
        this.usersInvited.delete(id);
      }
    }
  }

  @SubscribeMessage("spectatePlayer")
  handleSpectatePlayer(socket: Socket, playerIdToSpectate: number) {
    // const socketId = this.usersSockets.get(socket);
    // for (let [sock, sockId] of this.usersSockets) {
    //   if (sockId === socketId) {
    //     this.server
    //       .to(sock.id)
    //       .emit("spectateGameClient", playerIdToSpectate.toString());
    //   }
    // }
    this.server
      .to(socket.id)
      .emit("spectateGameClient", playerIdToSpectate.toString());
  }

  /** Disconnect */
  handleDisconnect(socket: Socket) {
    const userId: number = this.usersSockets.get(socket);
    if (userId !== undefined)
      this.setProfile({ id: userId, status: "offline" });
    this.server.emit("updateStatusFromServer", this.usersProfiles);
    this.server.emit("updateSearchBarUserList", this.usersProfiles);
    this.usersSockets.delete(socket);
  }
}
