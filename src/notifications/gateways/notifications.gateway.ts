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
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log('Cliente conectado:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Cliente desconectado:', client.id);
  }

  emitNotificationToUser(userId: string, notification: unknown) {
    console.log(`Enviando notificación a user-${userId}`);

    this.server.to(`user-${userId}`).emit('notification:new', notification);
  }

  emitNotificationToAdmin(notification: unknown) {
    this.server.to('admin').emit('notification:admin', notification);
  }

  @SubscribeMessage('join')
  handleJoinRoom(client: Socket, userId: string) {
    console.log(`Cliente ${client.id} intentando unirse a user-${userId}`);

    client.join(`user-${userId}`);

    console.log(`Cliente ${client.id} unido a user-${userId}`);
  }

  @SubscribeMessage('join-admin')
  handleJoinAdminRoom(client: Socket) {
    client.join('admin');
    console.log(`Admin ${client.id} unido a sala admin`);
  }
}
