import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@rooster-ai/shared';

export class WebSocketService {
  private io: SocketIOServer;
  private userSockets: Map<string, string[]> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupAuthentication();
    this.setupEventHandlers();
  }

  private setupAuthentication() {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        socket.data.userId = payload.userId;
        socket.data.tenantId = payload.tenantId;
        socket.data.role = payload.role;
        
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      const tenantId = socket.data.tenantId;

      console.log(`User ${userId} connected to tenant ${tenantId}`);

      // Track user socket connections
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)!.push(socket.id);

      // Join tenant room for tenant-wide broadcasts
      socket.join(`tenant:${tenantId}`);

      // Join user-specific room for personal notifications
      socket.join(`user:${userId}`);

      // Handle roster subscription
      socket.on('subscribe:roster', (rosterId: string) => {
        socket.join(`roster:${rosterId}`);
        console.log(`User ${userId} subscribed to roster ${rosterId}`);
      });

      // Handle roster unsubscription
      socket.on('unsubscribe:roster', (rosterId: string) => {
        socket.leave(`roster:${rosterId}`);
        console.log(`User ${userId} unsubscribed from roster ${rosterId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
        
        // Remove socket from user tracking
        const userSocketIds = this.userSockets.get(userId) || [];
        const updatedSockets = userSocketIds.filter(id => id !== socket.id);
        
        if (updatedSockets.length === 0) {
          this.userSockets.delete(userId);
        } else {
          this.userSockets.set(userId, updatedSockets);
        }
      });
    });
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Send update to all users in a tenant
  sendToTenant(tenantId: string, event: string, data: any) {
    this.io.to(`tenant:${tenantId}`).emit(event, data);
  }

  // Send update to all users subscribed to a roster
  sendToRoster(rosterId: string, event: string, data: any) {
    this.io.to(`roster:${rosterId}`).emit(event, data);
  }

  // Broadcast roster updates
  broadcastRosterUpdate(rosterId: string, updateType: string, data: any) {
    this.sendToRoster(rosterId, 'roster:updated', {
      type: updateType,
      rosterId,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast shift updates
  broadcastShiftUpdate(rosterId: string, shiftId: string, updateType: string, data: any) {
    this.sendToRoster(rosterId, 'shift:updated', {
      type: updateType,
      rosterId,
      shiftId,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Send real-time notification
  sendNotification(userId: string, notification: any) {
    this.sendToUser(userId, 'notification:new', notification);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}
