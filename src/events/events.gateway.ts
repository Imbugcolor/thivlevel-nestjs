import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ServerToClientEvents } from './interfaces/events.gateway';
import { TRANSACTION_RESULT } from './transaction.enum';

@WebSocketGateway({ cors: true })
export class EventsGateway {
  @WebSocketServer()
  server: Server<any, ServerToClientEvents>;

  async orderTransactionSucessEvent(socketId: string) {
    return this.server.to(`${socketId}`).emit(TRANSACTION_RESULT.SUCCESS);
  }

  async orderTransactionFailedEvent(socketId: string, message: string) {
    return this.server
      .to(`${socketId}`)
      .emit(TRANSACTION_RESULT.FAILED, message);
  }
}
