import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import {
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService
  ) {}

  @WebSocketServer()
  server!: Server;

  private connectedUsers = new Map<
    string,
    string
  >();

  handleConnection(
    client: Socket,
  ) {
    console.log(
      `Client connected: ${client.id}`,
    );
  }

  handleDisconnect(
    client: Socket,
  ) {
    for (const [
      userId,
      socketId,
    ] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(
          userId,
        );
        break;
      }
    }

    console.log(
      `Client disconnected: ${client.id}`,
    );
  }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('register')
    handleRegister(
    @ConnectedSocket()
    client: Socket,
    ) {
    const user = (client as any).user;

    this.connectedUsers.set(
    user.sub,
    client.id,
    );

    return {
    success: true,
    };
    }
  async sendToUser(
    userId: string,
    event: string,
    payload: any,
  ) {
    const socketId =
      this.connectedUsers.get(userId);

    if (!socketId) {
      return;
    }

    this.server
      .to(socketId)
      .emit(event, payload);
  }

  async broadcast(
    event: string,
    payload: any,
  ) {
    this.server.emit(
      event,
      payload,
    );
  }
}