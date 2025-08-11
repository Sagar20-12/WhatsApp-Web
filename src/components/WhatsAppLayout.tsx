import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  MoreVertical, 
  MessageCircle, 
  Phone, 
  Video, 
  Send, 
  Paperclip, 
  Mic, 
  Smile,
  ArrowLeft,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Akshay Kumar',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '10:30 AM',
    unreadCount: 2,
    isOnline: true,
  },
];

interface WhatsAppLayoutProps {
  currentUser: User;
  onLogout: () => void;
}

export const WhatsAppLayout: React.FC<WhatsAppLayoutProps> = ({ currentUser, onLogout }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMobile();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Filter contacts based on search query and use updated contact if selected
  const filteredContacts = mockContacts.map(contact => 
    contact.id === selectedContact?.id ? selectedContact : contact
  ).filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Connect Socket.IO
  useEffect(() => {
    const socketUrl = (import.meta as any).env.VITE_SOCKET_URL || 'http://localhost:4000';
    const s = io(socketUrl, { transports: ['websocket'] });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  // Join room when selecting contact
  useEffect(() => {
    if (socket && selectedContact) {
      socket.emit('join', selectedContact.id);
    }
  }, [socket, selectedContact]);

  // Receive realtime events
  useEffect(() => {
    if (!socket) return;
    const onMessage = (message: Message) => {
      // Messages received from others should render as received
      const normalized = { ...message, isSent: false } as Message;
      setMessages(prev => [...prev, normalized]);
    };
    const onTyping = ({ typing }: { typing: boolean }) => {
      setIsTyping(typing);
    };
    socket.on('message', onMessage);
    socket.on('typing', onTyping);
    return () => {
      socket.off('message', onMessage);
      socket.off('typing', onTyping);
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedContact) {
      const now = new Date();
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        timestamp: now.toLocaleString([], { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isSent: true
      };
      setMessages([...messages, message]);
      
      // Update the contact's last message
      const updatedContact = { ...selectedContact };
      updatedContact.lastMessage = newMessage;
      updatedContact.timestamp = message.timestamp;
      setSelectedContact(updatedContact);
      
      // Emit to server for realtime broadcast
      if (socket) {
        socket.emit('message', { roomId: selectedContact.id, message });
      }
      setNewMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    const typing = e.target.value.length > 0;
    setIsTyping(typing);
    if (socket && selectedContact) {
      socket.emit('typing', { roomId: selectedContact.id, typing });
    }
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    // Clear unread count when contact is selected
    contact.unreadCount = 0;
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleMenuClick = () => {
    // Show logout option in menu
    if (confirm('Do you want to logout?')) {
      onLogout();
    }
  };

  const handleStatusClick = () => {
    alert('Status clicked! This would open status updates.');
  };

  const handleNewChatClick = () => {
    alert('New chat clicked! This would open new chat options.');
  };

  const handleSearchClick = () => {
    alert('Search clicked! This would open message search.');
  };

  const handleAttachmentClick = () => {
    alert('Attachment clicked! This would open file picker.');
  };

  const handleEmojiClick = () => {
    alert('Emoji clicked! This would open emoji picker.');
  };

  const handleVoiceClick = () => {
    alert('Voice message clicked! This would start voice recording.');
  };

  const handleCallClick = () => {
    alert('Call clicked! This would initiate a voice call.');
  };

  const handleVideoCallClick = () => {
    alert('Video call clicked! This would initiate a video call.');
  };

  const handleMoreOptionsClick = () => {
    alert('More options clicked! This would open chat options menu.');
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={cn(
        "bg-white border-r border-gray-200 flex flex-col",
        isMobile ? "w-full" : "w-1/3 min-w-[350px]",
        !showSidebar && isMobile && "hidden"
      )}>
        {/* Header */}
        <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
              <AvatarFallback>Me</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{currentUser.name}</div>
              <div className="text-xs opacity-80">{currentUser.email}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20"
              onClick={handleStatusClick}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20"
              onClick={handleMenuClick}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search or start new chat"
              className="pl-10 bg-white border-gray-300 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
              >
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Contacts List */}
        <ScrollArea className="flex-1 whatsapp-scrollbar">
          <div className="space-y-1">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={cn(
                  "flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200",
                  selectedContact?.id === contact.id && "bg-gray-100"
                )}
                onClick={() => handleContactClick(contact)}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {contact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-500">{contact.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                    {contact.unreadCount > 0 && (
                      <Badge className="bg-[#25D366] text-white text-xs px-2 py-1 rounded-full">
                        {contact.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col",
        isMobile && !showSidebar ? "w-full" : "hidden md:flex"
      )}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(true)}
                    className="md:hidden"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                <Avatar className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={selectedContact.avatar} />
                  <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedContact.isOnline ? 'online' : `last seen ${selectedContact.lastSeen}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSearchClick}
                >
                  <Search className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCallClick}
                >
                  <Phone className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleVideoCallClick}
                >
                  <Video className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleMoreOptionsClick}
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-[#ECE5DD] whatsapp-bg-pattern">
              <ScrollArea className="h-full p-4 whatsapp-scrollbar">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Start a conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.isSent ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "whatsapp-message-bubble px-4 py-2 rounded-lg shadow-sm",
                            message.isSent
                              ? "bg-[#25D366] text-white sent"
                              : "bg-white text-gray-900 received"
                          )}
                        >
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          <p className={cn(
                            "text-xs mt-1 opacity-70",
                            message.isSent ? "text-green-100" : "text-gray-500"
                          )}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="whatsapp-message-bubble px-4 py-2 rounded-lg shadow-sm bg-white text-gray-900 received">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleEmojiClick}
                >
                  <Smile className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleAttachmentClick}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message"
                    className="rounded-full pr-12"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={newMessage.trim() ? handleSendMessage : handleVoiceClick}
                  disabled={!newMessage.trim() && !selectedContact}
                >
                  {newMessage.trim() ? (
                    <Send className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to WhatsApp Web</h2>
              <p className="text-gray-600 mb-4">Select a chat to start messaging</p>
              <Button 
                onClick={handleNewChatClick}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white"
              >
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
