import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(
    _client: Socket,
  ) {}

  handleDisconnect(
    _client: Socket,
  ) {}

  emitNotificationToUser(
    userId: string,
    notification: unknown,
  ) {
    this.server
      .to(`user-${userId}`)
      .emit(
        'notification:new',
        notification,
      );
  }

  @SubscribeMessage('join')
  handleJoinRoom(
    client: Socket,
    userId: string,
  ) {
    client.join(`user-${userId}`);
  }
}