import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents } from './interfaces/events.gateway';
import { TRANSACTION_RESULT } from './transaction.enum';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';
import { Role } from 'src/user/enum/role.enum';
import { Room } from './room.enum';
@WebSocketGateway({ cors: true })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  @WebSocketServer()
  server: Server<any, ServerToClientEvents>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    // console.log(server);
  }

  async handleConnection(client: Socket) {
    const { authorization } = client.handshake.headers;

    if (authorization && (authorization as string)?.split(' ')[1]) {
      try {
        client.data.user = await this.jwtService.verifyAsync(
          (authorization as string).split(' ')[1],
          {
            secret: this.configService.get('JWT_SECRET'),
          },
        );

        // join room follow user role
        if (client.data.user) {
          if (client.data.user.role.some((rl: string) => rl === Role.Admin)) {
            client.join(Room.ADMIN);
          }
          if (client.data.user.role.some((rl: string) => rl === Role.User)) {
            client.join(Room.USER);
          }
        }
        // store client into Redis
        await this.redisService.addClient(client.data.user, client.id);
      } catch (error) {
        console.log(error);
        client.disconnect();
      }
    } else {
      console.log('CÓ lỗi');
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data && client.data.user) {
      await this.redisService.removeClient(client.data.user, client.id);
    }
  }

  // NOTIFICATIONS
  async sendNotification<T>({
    userId,
    adminNotification = false,
    message,
  }: {
    userId?: string;
    adminNotification?: boolean;
    message: T;
  }) {
    if (userId) {
      const client = await this.redisService.getClientById(userId);
      if (!client) return;
      return client.socketIds.forEach((id) =>
        this.server.to(`${id}`).emit('sendNotification', message),
      );
    }
    if (adminNotification) {
      return this.server.to(Room.ADMIN).emit('sendNotification', message);
    }
    return this.server.to(Room.USER).emit('sendNotification', message);
  }

  // TRANSACTION
  async orderTransactionSucessEvent(socketId: string) {
    return this.server.to(`${socketId}`).emit(TRANSACTION_RESULT.SUCCESS);
  }

  async orderTransactionFailedEvent(socketId: string, message: string) {
    return this.server
      .to(`${socketId}`)
      .emit(TRANSACTION_RESULT.FAILED, message);
  }
}
