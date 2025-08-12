import React, { useState, useEffect } from 'react';

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
  phoneNumber?: string;
  isPinned?: boolean;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'received';
}

interface WhatsAppDesktopLayoutProps {
  currentUser: User;
  onLogout: () => void;
}

// Mock data - keeping your original chats
const mockChats: Contact[] = [
  {
    id: '1',
    name: 'Ravi Kumar',
    avatar: '',
    lastMessage: 'Hi, I\'d like to know more about your services.',
    timestamp: '10:00 AM',
    unreadCount: 0,
    isOnline: true,
    phoneNumber: '919937320320',
    isPinned: false
  },
  {
    id: '2',
    name: 'Neha Joshi',
    avatar: '',
    lastMessage: 'Hi, I saw your ad. Can you share more details?',
    timestamp: '10:16 AM',
    unreadCount: 0,
    isOnline: false,
    phoneNumber: '929967673820',
    isPinned: false
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hi, I\'d like to know more about your services.',
    timestamp: '10:00 AM',
    isSent: false,
    status: 'read'
  },
  {
    id: '2',
    text: 'Thank you for your inquiry. We\'d be happy to help you with our services. Could you please let us know what specific services you\'re interested in?',
    timestamp: '10:02 AM',
    isSent: true,
    status: 'read'
  }
];

export const WhatsAppDesktopLayout: React.FC<WhatsAppDesktopLayoutProps> = ({ currentUser, onLogout }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'favourites' | 'groups'>('all');
  const [showAdBanner, setShowAdBanner] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(false);
        setShowChatList(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setMessages(mockMessages);
    if (isMobile) {
      setShowChatList(false);
    }
  };

  const handleBackToChats = () => {
    setShowChatList(true);
    setSelectedContact(null);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedContact) {
      const newMsg: Message = {
        id: Date.now().toString(),
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSent: true,
        status: 'sent'
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className={`h-screen flex ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Left Navigation Bar - Hidden on mobile */}
      <div className={`${isMobile ? 'hidden' : 'w-20'} flex flex-col items-center py-4 border-r ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Profile with unread badge */}
        <div className="relative mb-6">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">8</span>
          </div>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col space-y-4">
          <button 
            className="w-10 h-10 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 relative"
            onClick={() => alert('Chats section - Already active')}
          >
            💬
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
          </button>
          <button 
            className="w-10 h-10 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 relative"
            onClick={() => alert('Status section - Coming soon!')}
          >
            ⭕
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
          </button>
          <button 
            className="w-10 h-10 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400"
            onClick={() => alert('Calls section - Coming soon!')}
          >
            📞
          </button>
          <button 
            className="w-10 h-10 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400"
            onClick={() => alert('Communities section - Coming soon!')}
          >
            👥
          </button>
        </div>

        {/* Settings and Theme Toggle */}
        <div className="mt-auto flex flex-col space-y-4">
          <button 
            className="w-10 h-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button 
            className="w-10 h-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400"
            onClick={() => alert('Settings - Coming soon!')}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Chat List Panel */}
      <div className={`${isMobile ? 'w-full' : 'w-80 lg:w-96'} flex flex-col border-r ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} ${isMobile && !showChatList ? 'hidden' : 'block'}`}>
        {/* Header */}
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button 
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={toggleSidebar}
              >
                ☰
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">WhatsApp</h1>
            </div>
                         <div className="flex items-center space-x-2">
               <button className="w-8 h-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors text-purple-600 dark:text-purple-400">
                 ➕
               </button>
               <button className="w-8 h-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors text-purple-600 dark:text-purple-400">
                 ⋮
               </button>
             </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
                         <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search or start a new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-10 p-3 rounded-lg outline-none border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
              } focus:ring-1 focus:ring-green-500 transition-colors`}
            />
                         <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">⋮</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 overflow-x-auto">
            {(['all', 'unread', 'favourites', 'groups'] as const).map((filter) => (
              <button
                key={filter}
                className={`capitalize whitespace-nowrap text-xs px-3 py-1 rounded-full transition-colors ${
                  activeFilter === filter 
                    ? 'bg-green-500 text-white shadow-sm' 
                    : theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Ad Banner - Hidden on mobile */}
        {showAdBanner && !isMobile && (
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-blue-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-blue-500">📢</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Reach new customers</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Advertise your business on Facebook & Instagram. Get started &gt;</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAdBanner(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Archived Section - Hidden on mobile */}
        {!isMobile && (
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
              <span className="text-gray-500">📁</span>
              <span className="font-semibold text-gray-900 dark:text-white">Archived</span>
            </div>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ${
                  selectedContact?.id === chat.id && (theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100')
                }`}
                onClick={() => handleContactClick(chat)}
              >
                <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{chat.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                                         <h3 className="font-semibold truncate text-gray-900 dark:text-white font-medium">{chat.name}</h3>
                    <div className="flex items-center space-x-1">
                                             {chat.isPinned && <span className="text-gray-600 dark:text-gray-500">📌</span>}
                                             <span className="text-xs text-gray-600 dark:text-gray-500">{chat.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                                         <p className="text-sm text-gray-700 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No chats</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
            <span className="mr-2">🔒</span>
            Your personal messages are end-to-end encrypted
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} ${isMobile && showChatList ? 'hidden' : 'block'}`}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <button 
                    onClick={handleBackToChats}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                )}
                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-white font-bold">{selectedContact.name.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{selectedContact.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedContact.isOnline ? 'online' : 'last seen recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400">🔍</button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400">📞</button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400">📹</button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400">⋮</button>
              </div>
            </div>

            {/* Messages Area */}
            <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="h-full p-4 space-y-4 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg shadow-sm max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ${
                        message.isSent
                          ? 'bg-green-500 text-white'
                          : theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 shadow-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs opacity-70 ${message.isSent ? 'text-green-100' : 'text-gray-500'}`}>
                          {message.timestamp}
                        </p>
                        {message.isSent && (
                          <div className="flex items-center space-x-1">
                            {message.status === 'sent' && (
                              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            )}
                            {message.status === 'delivered' && (
                              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                            )}
                            {message.status === 'read' && (
                              <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className={`p-4 border-t ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400">😊</button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400">📎</button>
                <div className="flex-1 relative">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message"
                    className={`w-full p-3 rounded-full outline-none border ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                    } focus:ring-1 focus:ring-green-500 transition-colors`}
                  />
                </div>
                <button
                  onClick={newMessage.trim() ? handleSendMessage : undefined}
                  disabled={!newMessage.trim()}
                  className={`p-2 rounded-lg transition-colors ${newMessage.trim() ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-500'}`}
                >
                  {newMessage.trim() ? '📤' : '🎤'}
                </button>
              </div>
            </div>
          </>
        ) : (
          // Windows Download Promotional Screen
          <div className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="text-center max-w-md px-4">
              {/* Laptop with Video Call Illustration */}
              <div className="mb-8">
                <div className="relative w-64 h-32 mx-auto">
                  {/* Silver Laptop */}
                  <div className="absolute left-1/2 top-8 transform -translate-x-1/2 w-32 h-20 bg-gray-300 rounded-lg shadow-lg">
                    {/* Laptop Screen with Video Grid */}
                    <div className="w-full h-16 bg-gray-800 rounded-t-lg p-1">
                      <div className="grid grid-cols-3 gap-1 h-full">
                        {Array.from({ length: 9 }, (_, i) => (
                          <div key={i} className="bg-gray-600 rounded-sm flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Laptop Base */}
                    <div className="w-full h-4 bg-gray-400 rounded-b-lg"></div>
                  </div>
                  {/* WhatsApp Logo in front */}
                  <div className="absolute left-1/2 top-4 transform -translate-x-1/2 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl">💬</span>
                  </div>
                </div>
              </div>
              
                             <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Download WhatsApp for Windows</h2>
               <p className="text-gray-600 dark:text-gray-300 mb-8">
                 Make calls, share your screen and get a faster experience when you download the Windows app.
               </p>
              
              <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors mb-8">
                Download
              </button>
              
                             <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                 <span className="mr-2">🔒</span>
                 Your personal messages are end-to-end encrypted
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && showSidebar && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={toggleSidebar}
          ></div>
          <div className={`absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-bold">👤</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Profile</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Settings & account</p>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-3 text-gray-900 dark:text-white">
                  <span>💬</span>
                  <span>Chats</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-3 text-gray-900 dark:text-white">
                  <span>⭕</span>
                  <span>Status</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-3 text-gray-900 dark:text-white">
                  <span>📞</span>
                  <span>Calls</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-3 text-gray-900 dark:text-white">
                  <span>👥</span>
                  <span>Communities</span>
                </button>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={toggleTheme}
                  className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-3 text-gray-900 dark:text-white"
                >
                  <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-3 text-gray-900 dark:text-white">
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
