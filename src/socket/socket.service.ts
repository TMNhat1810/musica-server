import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class SocketService {
  constructor(private readonly socketGateway: SocketGateway) {}

  async emitAddComment() {}

  async emitEditComment() {}

  async emitDeleteComment() {}

  async emitEditReply() {}

  async emitDeleteReply() {}
}
