import { ILogger } from '../utils/logger';
import { Server } from 'socket.io';
import { PrismaClient } from '../controller/mysqlClient/client';

export class SocketRoutes{

    public socketRoute(app: any, prisma: PrismaClient, logger: ILogger, cache: any, channel: any, io: Server): void {
        io.on('connection', (socket) => {
            // ...
            socket.data.username = 'alice';
        });
    }
}