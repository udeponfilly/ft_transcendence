import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: 'http://localhost:3001',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect
{
  private userSockets: Map<Socket, number>
  @WebSocketServer() public server: Server;

  constructor() {
    this.userSockets = new Map<Socket, number>
  }

  getSocket(idToFind: number): Socket {
    for (let [ socket, id ] of this.userSockets) {
      if (id === idToFind)
        return (socket);
    }
    return (undefined);
  }

  handleConnection(socket: Socket) {}

  @SubscribeMessage('initTable')
  handleInitTable(socket: Socket, userId: number) {
    this.userSockets.set(socket, userId)
  }

  handleDisconnect(socket: Socket) {
    socket.rooms.forEach(
      (room) => socket.leave(room)
    )
    this.userSockets.delete(socket)
  }

  @SubscribeMessage('newChanFromClient')
  async handleNewChannel(socket: Socket, chan: any) {
    socket.join("chat" + chan.id);

    if (chan.type === "dm"){
      let user2;
        
      if (chan.members[0].id === this.userSockets.get(socket))
        user2 = chan.members[1].id;
      else
        user2 = chan.members[0].id;
      for (let [userSocket, id] of this.userSockets) {
        if (id === user2)
          userSocket.join("chat" + chan.id)
      }
    this.server.to("chat" + chan.id).emit('newChanFromServer', chan)
    }
    else {
      let isInChan: boolean;
      let withoutMessageChan = {... chan};
      delete withoutMessageChan.Message;
      
      this.server.to("chat" + chan.id).emit('newChanFromServer', chan)
      for (let [userSocket, id] of this.userSockets) {
        isInChan = false;
        for (let room of userSocket.rooms) {
          if (room === "chat" + chan.id) {
            isInChan = true;
            break ;
          }
        }
        if (!isInChan)
          userSocket.emit('newChanFromServer', withoutMessageChan);
      }
    }
  }

  @SubscribeMessage('updateChanFromClient')
  handleUpdateChannel(socket: Socket, chan: any) : void {
    let isInChan: boolean;
    let withoutMessageChan = {... chan};
    delete withoutMessageChan.Message;

    this.server.to("chat" + chan.id).emit('updateChanFromServer', chan)
    for (let [userSocket, id] of this.userSockets) {
      isInChan = false;
      for (let room of userSocket.rooms) {
        if (room === "chat" + chan.id) {
          isInChan = true;
          break ;
        }
      }
      if (!isInChan)
        userSocket.emit('updateChanFromServer', withoutMessageChan);
    }
  }

  @SubscribeMessage('newMsgFromClient')
  handleNewMessage(socket: Socket, message: {room: string, message: any}) : void {
    this.server.to(message.room).emit('newMsgFromServer', message.message)
  }

  @SubscribeMessage('joinChatRoom')
  handleJoinRoom(socket: Socket, chanID: number): void {
    socket.join("chat" + chanID);
  }

  @SubscribeMessage('leaveChatRoom')
  handleLeaveRoom(socket: Socket, chanID: number): void {
    socket.leave("chat" + chanID);
  }

  @SubscribeMessage('banFromClient')
  banUser(socket: Socket, data: {bannedId: number, chanId: number}): void {
    this.getSocket(data.bannedId).leave("chat" + data.chanId);
  }

  @SubscribeMessage('blockFromClient')
  blockUser(socket: Socket, data: any): void {
    const targetSocket = this.getSocket(data.target_id);

    if (targetSocket)
      targetSocket.emit('blockFromServer', data);
  }

  @SubscribeMessage('unblockFromClient')
  unblockUser(socket: Socket, data: any): void {
    const targetSocket = this.getSocket(data.target_id);

    if (targetSocket)
      targetSocket.emit('unblockFromServer', data.id);
  }
  
}