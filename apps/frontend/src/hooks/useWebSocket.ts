'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

export function useWebSocket() {
  const socket = useRef<Socket | null>(null);
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Connect to WebSocket server
    socket.current = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      auth: {
        token,
      },
    });

    // Connection events
    socket.current.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Roster events
    socket.current.on('roster:updated', (data) => {
      toast.success('Roster has been updated');
      // Trigger roster refresh
      window.dispatchEvent(new CustomEvent('roster:refresh'));
    });

    socket.current.on('shift:updated', (data) => {
      toast.success('Shift has been updated');
      // Trigger roster refresh
      window.dispatchEvent(new CustomEvent('roster:refresh'));
    });

    // Notification events
    socket.current.on('notification:new', (notification) => {
      toast.success(notification.title);
      // Trigger notification refresh
      window.dispatchEvent(new CustomEvent('notifications:refresh'));
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [isAuthenticated, token]);

  const subscribeToRoster = (rosterId: string) => {
    if (socket.current) {
      socket.current.emit('subscribe:roster', rosterId);
    }
  };

  const unsubscribeFromRoster = (rosterId: string) => {
    if (socket.current) {
      socket.current.emit('unsubscribe:roster', rosterId);
    }
  };

  return {
    subscribeToRoster,
    unsubscribeFromRoster,
  };
}
