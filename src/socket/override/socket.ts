import { Socket } from 'socket.io';

export class SocketIO extends Socket {
  public room?: string;
}
