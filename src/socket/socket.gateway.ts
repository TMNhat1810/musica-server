import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketIO } from './override/socket';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  @SubscribeMessage('join')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: SocketIO,
  ) {
    client.join(data.room);
    client.room = data.room;
  }

  @SubscribeMessage('leave')
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: SocketIO,
  ) {
    client.leave(data.room);
    client.room = null;
  }
}
