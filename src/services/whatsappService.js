// Service to fetch WhatsApp data from MongoDB
// This would typically connect to your backend API that queries MongoDB

export class WhatsAppService {
  constructor() {
    // In a real app, this would be your API endpoint
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    console.log('WhatsApp Service initialized with baseUrl:', this.baseUrl);
  }

  // Fetch all conversations/chats
  async getConversations() {
    try {
      console.log('Fetching conversations from:', `${this.baseUrl}/conversations`);
      
      // Add a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${this.baseUrl}/conversations`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const conversations = await response.json();
      console.log('Received conversations:', conversations);
      
      // Transform the data to match our UI expectations
      const transformedConversations = conversations.map(conv => ({
        id: conv.id,
        name: conv.name || 'Unknown Contact',
        avatar: '',
        lastMessage: conv.lastMessage || '',
        timestamp: conv.timestamp ? new Date(conv.timestamp * 1000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Now',
        unreadCount: conv.unreadCount || 0,
        isOnline: conv.isOnline || false,
        phoneNumber: conv.phoneNumber || '',
        conversationId: conv.conversationId || conv.id
      }));
      
      console.log('Transformed conversations:', transformedConversations);
      return transformedConversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      console.log('Falling back to mock data');
      // Fallback to mock data if API is not available
      return [
        {
          id: 'conv1-msg1-user',
          name: 'Ravi Kumar',
          avatar: '',
          lastMessage: 'Hi, I\'d like to know more about your services.',
          timestamp: '10:00 AM',
          unreadCount: 0,
          isOnline: true,
          phoneNumber: '919937320320',
          conversationId: 'conv1-convo-id'
        },
        {
          id: 'conv2-msg1-user',
          name: 'Neha Joshi',
          avatar: '',
          lastMessage: 'Hi, I saw your ad. Can you share more details?',
          timestamp: '10:16 AM',
          unreadCount: 0,
          isOnline: false,
          phoneNumber: '929967673820',
          conversationId: 'conv2-convo-id'
        }
      ];
    }
  }

  // Fetch messages for a specific conversation
  async getMessages(conversationId) {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/messages`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const messages = await response.json();
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Fallback to mock data if API is not available
      const messages = {
        'conv1-msg1-user': [
          {
            id: 'wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=',
            text: 'Hi, I\'d like to know more about your services.',
            timestamp: '10:00 AM',
            isSent: false,
            status: 'read',
            from: '919937320320',
            contactName: 'Ravi Kumar'
          },
          {
            id: 'wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggNDc4NzZBQ0YxMjdCQ0VFOTk2NzA3MTI4RkZCNjYyMjc=',
            text: 'Thank you for your inquiry. We\'d be happy to help you with our services. Could you please let us know what specific services you\'re interested in?',
            timestamp: '10:02 AM',
            isSent: true,
            status: 'read',
            from: '918329446654',
            contactName: 'Business'
          }
        ],
        'conv2-msg1-user': [
          {
            id: 'wamid.HBgMOTI5OTY3NjczODIwFQIAEhggQ0FBQkNERUYwMDFGRjEyMzQ1NkZGQTk5RTJCM0I2NzY=',
            text: 'Hi, I saw your ad. Can you share more details?',
            timestamp: '10:16 AM',
            isSent: false,
            status: 'read',
            from: '929967673820',
            contactName: 'Neha Joshi'
          },
          {
            id: 'wamid.HBgMOTI5OTY3NjczODIwFQIAEhggNTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU=',
            text: 'Of course! I\'d be happy to share more details about our services. What specific information are you looking for?',
            timestamp: '10:18 AM',
            isSent: true,
            status: 'delivered',
            from: '918329446654',
            contactName: 'Business'
          }
        ]
      };

      return messages[conversationId] || [];
    }
  }

  // Send a new message
  async sendMessage(conversationId, messageText) {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      // Return mock response if API is not available
      const newMessage = {
        id: `msg_${Date.now()}`,
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isSent: true,
        status: 'sent',
        from: '918329446654',
        contactName: 'Business'
      };

      return newMessage;
    }
  }

  // Get conversation statistics
  async getConversationStats() {
    try {
      // Simulate API call
      return {
        totalConversations: 2,
        totalMessages: 4,
        unreadMessages: 0,
        statusBreakdown: {
          sent: 2,
          delivered: 1,
          read: 1
        }
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {};
    }
  }
}

// Create a singleton instance
export const whatsappService = new WhatsAppService();
