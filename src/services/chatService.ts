import { ApiClient } from '@/lib/api/client';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  organizationId: string;
  userId: string;
  applicationId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
  _count?: { messages: number };
}

export interface SendChatMessagePayload {
  message: string;
  conversationId?: string;
  applicationId?: string;
  context?: Record<string, any>;
}

export interface SendChatMessageResponse {
  conversationId: string;
  title: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export const chatService = {
  /**
   * Send chat message and get response
   */
  async sendMessage(payload: SendChatMessagePayload): Promise<SendChatMessageResponse> {
    try {
      return await ApiClient.post<SendChatMessageResponse>('/chat', payload);
    } catch {
      // Offline / network fallback handler
      const fallbackTitle = payload.message.length > 30 ? `${payload.message.substring(0, 27)}...` : payload.message;
      const conversationId = payload.conversationId || `conv-local-${Date.now()}`;
      
      let responseContent = `### LaunchPad Assistant\n\nTo help you with **"${payload.message}"**:\n\n1. **Applications**: Navigate to **Applications** tab to create, configure, or publish apps.\n2. **Integrations**: Navigate to **Integrations** to register REST API connectors or webhooks.\n3. **Marketplace**: Browse verified plugins under **Marketplace**.\n4. **Team Roles**: Assign SUPER_ADMIN, ORG_ADMIN, or DEVELOPER roles under **Organization > Team Members**.`;

      if (payload.message.toLowerCase().includes('create')) {
        responseContent = `### LaunchPad Assistant — Application Creation Guide\n\n1. Click **Applications** in the left sidebar.\n2. Click the **+ Create Application** button at top-right.\n3. Enter your Application Name, description, and target mode (Standalone vs. Integration Hub).\n4. Select a starter template or enable modules manually.\n5. Click **Generate Application**.`;
      } else if (payload.message.toLowerCase().includes('integration')) {
        responseContent = `### LaunchPad Assistant — Integration Hub Guide\n\n1. Go to **Integrations** in the dashboard.\n2. Click **+ Register Connector**.\n3. Select authentication (API Key, Bearer Token, JWT).\n4. Enter Base URL and configure endpoints.`;
      }

      return {
        conversationId,
        title: fallbackTitle,
        userMessage: {
          id: `msg-u-${Date.now()}`,
          conversationId,
          role: 'user',
          content: payload.message,
          createdAt: new Date().toISOString(),
        },
        assistantMessage: {
          id: `msg-a-${Date.now()}`,
          conversationId,
          role: 'assistant',
          content: responseContent,
          createdAt: new Date().toISOString(),
        },
      };
    }
  },

  /**
   * List conversations for tenant
   */
  async getConversations(): Promise<ChatConversation[]> {
    try {
      return await ApiClient.get<ChatConversation[]>('/chat/conversations');
    } catch {
      return [];
    }
  },

  /**
   * Get conversation details by ID
   */
  async getConversationById(id: string): Promise<ChatConversation | null> {
    try {
      return await ApiClient.get<ChatConversation>(`/chat/conversations/${id}`);
    } catch {
      return null;
    }
  },

  /**
   * Delete conversation
   */
  async deleteConversation(id: string): Promise<boolean> {
    try {
      await ApiClient.delete(`/chat/conversations/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
