import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializeSocket } from '@/utils/Socket';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket || !('server' in res.socket) || !res.socket.server) {
    throw new Error('HTTP server is not available on res.socket');
  }
  if ((res.socket.server as any).io) {
    console.log('Socket.io already running');
    res.end();
    return;
  }

  console.log('Initializing Socket.io...');

  if (!res.socket || !('server' in res.socket) || !res.socket.server) {
    throw new Error('HTTP server is not available on res.socket');
  }

  const httpServer: HTTPServer = res.socket.server as HTTPServer;
  const io = initializeSocket(httpServer);

  (res.socket.server as any).io = io;
  res.end();
}