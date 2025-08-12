import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Plus,
  Settings,
  Users,
  Hash,
  Star,
  Archive,
  Moon,
  Sun,
  Download,
  Lock,
  Trash2,
  Copy,
  Forward,
  ArrowLeft,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

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
  phoneNumber?: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
}

// Mock saved contacts
const savedContacts: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: '',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '10:30 AM',
    unreadCount: 0,
    isOnline: false,
    phoneNumber: '+1 555 123 4567'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    avatar: '',
    lastMessage: 'Can we meet tomorrow?',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
    phoneNumber: '+1 555 987 6543'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    avatar: '',
    lastMessage: 'Thanks for the help!',
    timestamp: '2 days ago',
    unreadCount: 0,
    isOnline: false,
    phoneNumber: '+1 555 456 7890'
  }
];

// Mock chat conversations
const mockChats: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: '',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '10:30 AM',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    avatar: '',
    lastMessage: 'Can we meet tomorrow?',
    timestamp: 'Yesterday',
    unreadCount: 1,
    isOnline: false,
  }
];

interface WhatsAppDesktopLayoutProps {
  currentUser: User;
  onLogout: () => void;
}

export const WhatsAppDesktopLayout: React.FC<WhatsAppDesktopLayoutProps> = ({ currentUser, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'favourites' | 'groups'>('all');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [selectedContactForChat, setSelectedContactForChat] = useState<Contact | null>(null);
  const [chats, setChats] = useState<Contact[]>(mockChats);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [messageMenuPosition, setMessageMenuPosition] = useState({ x: 0, y: 0 });
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filter chats based on search and active filter
  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'unread') {
      return matchesSearch && chat.unreadCount > 0;
    }
    if (activeFilter === 'favourites') {
      return matchesSearch && chat.name.includes('John');
    }
    if (activeFilter === 'groups') {
      return matchesSearch && chat.name.includes('Group');
    }
    return matchesSearch;
  });

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
      
      const updatedChats = chats.map(chat => 
        chat.id === selectedContact.id 
          ? { ...chat, lastMessage: newMessage, timestamp: message.timestamp }
          : chat
      );
      setChats(updatedChats);
      setSelectedContact({ ...selectedContact, lastMessage: newMessage, timestamp: message.timestamp });
      
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };



  const handleAddNewChat = (contact: Contact) => {
    const existingChat = chats.find(chat => chat.id === contact.id);
    if (!existingChat) {
      const newChat: Contact = {
        ...contact,
        lastMessage: '',
        timestamp: 'Now',
        unreadCount: 0,
        isOnline: false
      };
      setChats([newChat, ...chats]);
    }
    setShowNewChatDialog(false);
    setSelectedContactForChat(null);
  };

  const handleMenuClick = () => {
    if (confirm('Do you want to logout?')) {
      onLogout();
    }
  };

  const handleMessageRightClick = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setSelectedMessage(message);
    setMessageMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMessageMenu(true);
  };

  const handleDeleteMessage = () => {
    if (selectedMessage) {
      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      setShowMessageMenu(false);
      setSelectedMessage(null);
    }
  };

  const handleCopyMessage = () => {
    if (selectedMessage) {
      navigator.clipboard.writeText(selectedMessage.text);
      setShowMessageMenu(false);
      setSelectedMessage(null);
    }
  };

  const handleForwardMessage = () => {
    if (selectedMessage) {
      // In a real app, this would open a contact selection dialog
      alert('Forward message functionality would open contact selection');
      setShowMessageMenu(false);
      setSelectedMessage(null);
    }
  };

  // Close message menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMessageMenu(false);
      setSelectedMessage(null);
    };

    if (showMessageMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMessageMenu]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width >= 768) {
        setShowSidebar(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    const updatedChats = chats.map(chat => 
      chat.id === contact.id ? { ...chat, unreadCount: 0 } : chat
    );
    setChats(updatedChats);
    // Always hide sidebar on mobile when a contact is selected
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToChats = () => {
    setShowSidebar(true);
    setSelectedContact(null);
  };

  return (
    <div className={cn(
      "h-screen flex",
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
    )}>
      {/* Left Navigation Bar */}
      <div className={cn(
        "w-20 flex flex-col items-center py-4 border-r",
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        isMobile && "hidden"
      )}>
        {/* Profile with unread indicator */}
        <div className="relative mb-6">
          <Avatar className="w-12 h-12 cursor-pointer">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
            <AvatarFallback>Me</AvatarFallback>
          </Avatar>
          <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full p-0 flex items-center justify-center">
            8
          </Badge>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col space-y-4">
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Hash className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Users className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <MessageCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Archive className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Star className="w-5 h-5" />
          </Button>
        </div>

        {/* Settings and Theme Toggle */}
        <div className="mt-auto flex flex-col space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0"
            onClick={handleMenuClick}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Chat List Panel */}
      <div className={cn(
        "flex flex-col border-r",
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        isMobile ? "w-full" : "w-96",
        isMobile && !showSidebar && "hidden"
      )}>
        {/* Header */}
        <div className={cn(
          "p-4 border-b",
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        )}>
                     <div className="flex items-center justify-between mb-4">
             <div className="flex items-center space-x-3">
               {isMobile && (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setShowSidebar(false)}
                   className="md:hidden"
                 >
                   <Menu className="w-5 h-5" />
                 </Button>
               )}
               <h1 className="text-xl font-semibold">WhatsApp</h1>
             </div>
             <div className="flex items-center space-x-2">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="w-8 h-8 p-0"
                 onClick={() => setShowNewChatDialog(true)}
               >
                 <Plus className="w-4 h-4" />
               </Button>
               <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                 <MoreVertical className="w-4 h-4" />
               </Button>
             </div>
           </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search or start a new chat"
              className={cn(
                "pl-10",
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

                 {/* Filter Buttons */}
         <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
           <div className="flex space-x-1 overflow-x-auto">
             {(['all', 'unread', 'favourites', 'groups'] as const).map((filter) => (
               <Button
                 key={filter}
                 variant={activeFilter === filter ? "default" : "ghost"}
                 size="sm"
                 className={cn(
                   "capitalize whitespace-nowrap text-xs",
                   activeFilter === filter 
                     ? "bg-green-500 hover:bg-green-600 text-white" 
                     : theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                 )}
                 onClick={() => setActiveFilter(filter)}
               >
                 {filter}
               </Button>
             ))}
           </div>
         </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="space-y-1">
                         {filteredChats.map((chat) => (
               <div
                 key={chat.id}
                 className={cn(
                   "flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200",
                   selectedContact?.id === chat.id && (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')
                 )}
                 onClick={() => handleContactClick(chat)}
               >
                 <Avatar className="w-10 h-10 md:w-12 md:h-12">
                   <AvatarImage src={chat.avatar} />
                   <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                 </Avatar>
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between">
                     <h3 className="font-semibold truncate text-sm md:text-base">{chat.name}</h3>
                     <span className="text-xs text-gray-500">{chat.timestamp}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                     {chat.unreadCount > 0 && (
                       <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                         {chat.unreadCount}
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
         isMobile && (!selectedContact || showSidebar) && "hidden"
       )}>
        {selectedContact ? (
          <>
                         {/* Chat Header */}
             <div className={cn(
               "p-4 border-b flex items-center justify-between",
               theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
             )}>
               <div className="flex items-center space-x-3">
                                   {isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToChats}
                      className="md:hidden"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  )}
                 <Avatar className="w-10 h-10">
                   <AvatarImage src={selectedContact.avatar} />
                   <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                 </Avatar>
                 <div>
                   <h2 className="font-semibold">{selectedContact.name}</h2>
                   <p className="text-sm text-gray-500">
                     {selectedContact.isOnline ? 'online' : `last seen ${selectedContact.lastSeen || 'recently'}`}
                   </p>
                 </div>
               </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Search className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

                         {/* Messages Area */}
             <div className={cn(
               "flex-1",
               theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
             )}>
               <ScrollArea className="h-full p-2 md:p-4">
                 <div className="space-y-3 md:space-y-4">
                   {messages.length === 0 ? (
                     <div className="flex items-center justify-center h-full">
                       <div className="text-center text-gray-500">
                         <MessageCircle className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 opacity-50" />
                         <p className="text-sm md:text-base">No messages yet. Start a conversation!</p>
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
                              "px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-sm max-w-[75%] md:max-w-xs cursor-pointer hover:opacity-90 transition-opacity",
                              message.isSent
                                ? "bg-green-500 text-white"
                                : theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                            )}
                            onContextMenu={(e) => handleMessageRightClick(e, message)}
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
                 </div>
               </ScrollArea>
             </div>

                         {/* Message Input */}
             <div className={cn(
               "p-2 md:p-4 border-t",
               theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
             )}>
               <div className="flex items-center space-x-1 md:space-x-2">
                 <Button variant="ghost" size="sm" className="w-8 h-8 md:w-10 md:h-10 p-0">
                   <Smile className="w-4 h-4 md:w-5 md:h-5" />
                 </Button>
                 <Button variant="ghost" size="sm" className="w-8 h-8 md:w-10 md:h-10 p-0">
                   <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                 </Button>
                 <div className="flex-1 relative">
                   <Input
                     value={newMessage}
                     onChange={(e) => setNewMessage(e.target.value)}
                     onKeyPress={handleKeyPress}
                     placeholder="Type a message"
                     className={cn(
                       "rounded-full pr-10 md:pr-12 text-sm md:text-base",
                       theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                     )}
                   />
                 </div>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={newMessage.trim() ? handleSendMessage : undefined}
                   disabled={!newMessage.trim()}
                   className="w-8 h-8 md:w-10 md:h-10 p-0"
                 >
                   {newMessage.trim() ? (
                     <Send className="w-4 h-4 md:w-5 md:h-5" />
                   ) : (
                     <Mic className="w-4 h-4 md:w-5 md:h-5" />
                   )}
                 </Button>
               </div>
             </div>
          </>
        ) : (
          // Welcome Screen
          <div className={cn(
            "flex-1 flex items-center justify-center",
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
          )}>
                       <div className="text-center max-w-md px-4">
             <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4 md:mb-6">
               <div className="text-center">
                 <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-4">
                   <Video className="w-6 h-6 md:w-8 md:h-8 text-white" />
                 </div>
                 <div className="text-xl md:text-2xl font-bold text-green-500 mb-1 md:mb-2">WhatsApp</div>
               </div>
             </div>
             <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Download WhatsApp for Windows</h2>
             <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6">
               Make calls, share your screen and get a faster experience when you download the Windows app.
             </p>
             <Button className="bg-green-500 hover:bg-green-600 text-white mb-3 md:mb-4">
               <Download className="w-4 h-4 mr-2" />
               Download
             </Button>
             <div className="flex items-center justify-center text-xs md:text-sm text-gray-500">
               <Lock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
               Your personal messages are end-to-end encrypted
             </div>
           </div>
          </div>
        )}
      </div>

             {/* New Chat Dialog */}
       <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
         <DialogContent className={cn(
           "w-[90vw] max-w-md",
           theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
         )}>
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search contacts"
                className={cn(
                  "pl-10",
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                )}
              />
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {savedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg",
                      selectedContactForChat?.id === contact.id && (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')
                    )}
                    onClick={() => setSelectedContactForChat(contact)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => selectedContactForChat && handleAddNewChat(selectedContactForChat)}
                disabled={!selectedContactForChat}
              >
                Start Chat
              </Button>
            </div>
          </div>
                 </DialogContent>
       </Dialog>

       {/* Message Context Menu */}
       {showMessageMenu && selectedMessage && (
         <div
           className={cn(
             "fixed z-50 min-w-48 py-2 rounded-lg shadow-lg border",
             theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
           )}
           style={{
             left: messageMenuPosition.x,
             top: messageMenuPosition.y,
             transform: 'translate(-50%, -100%)'
           }}
         >
           <button
             onClick={handleCopyMessage}
             className={cn(
               "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2",
               theme === 'dark' ? 'text-white' : 'text-gray-900'
             )}
           >
             <Copy className="w-4 h-4" />
             <span>Copy</span>
           </button>
           <button
             onClick={handleForwardMessage}
             className={cn(
               "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2",
               theme === 'dark' ? 'text-white' : 'text-gray-900'
             )}
           >
             <Forward className="w-4 h-4" />
             <span>Forward</span>
           </button>
           <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
           <button
             onClick={handleDeleteMessage}
             className={cn(
               "w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 text-red-600 dark:text-red-400",
             )}
           >
             <Trash2 className="w-4 h-4" />
             <span>Delete</span>
           </button>
         </div>
       )}
     </div>
   );
 };
