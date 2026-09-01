import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../constant/config';

class SocketService {
  public socket: Socket | null = null;

  public connect(token: string) {
    if (!this.socket) {
      this.socket = io(BASE_URL, {
        transports: ['websocket'],
        autoConnect: true,
        auth: {
          token, // Backend expects socket.handshake.auth.token
        },
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully:', this.socket?.id);
        this.socket?.emit('userOnline', {});
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Common socket helper methods
  public emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  public on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
}

export const socketService = new SocketService();
