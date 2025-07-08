import { create } from 'zustand';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIState {
  messages: Message[];
  isLoading: boolean;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  messages: [
    {
      role: 'assistant',
      content: "Hello! I'm your AI roster assistant. I can help you optimize schedules, suggest staff assignments, and answer questions about your roster. How can I help you today?",
      timestamp: new Date(),
    },
  ],
  isLoading: false,

  sendMessage: async (content: string) => {
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      // For now, simulate AI response
      // In a real implementation, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse: Message = {
        role: 'assistant',
        content: `I understand you want to "${content}". Let me help you with that. Based on your current roster and staff availability, I can suggest some optimizations. Would you like me to analyze the current schedule and provide recommendations?`,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, aiResponse],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to get AI response');
    }
  },

  clearMessages: () => {
    set({
      messages: [
        {
          role: 'assistant',
          content: "Hello! I'm your AI roster assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ],
    });
  },
}));
