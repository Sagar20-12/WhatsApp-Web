# WhatsApp Web Clone

A modern, responsive WhatsApp Web clone built with React, TypeScript, and Tailwind CSS. Features include dark/light mode, real-time messaging, and MongoDB integration for WhatsApp webhook payloads.

## 🚀 Features

### ✨ UI Features
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes with persistent preferences
- **WhatsApp-like Interface**: Familiar three-panel layout with navigation
- **Interactive Elements**: Clickable navigation icons, message context menus
- **Real-time Updates**: Live message status indicators (sent, delivered, read)

### 📱 Chat Features
- **Message Management**: Send, receive, delete, copy, and forward messages
- **Contact Management**: Add new chats from saved contacts
- **Search & Filter**: Find conversations and filter by status
- **Profile Management**: User profile editing and settings

### 🔗 Backend Integration
- **MongoDB Integration**: Store and retrieve WhatsApp webhook payloads
- **API Server**: Express.js backend for data management
- **Payload Processing**: Script to process WhatsApp webhook data
- **Real Data Display**: Show actual conversations from MongoDB

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (running locally or accessible via connection string)
- **npm** or **yarn** package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd whatsapp-web-clone
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 4. Install Script Dependencies
```bash
cd scripts
npm install
cd ..
```

### 5. Environment Configuration

Create a `.env` file in the root directory:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017

# API Server
REACT_APP_API_URL=http://localhost:3001/api

# Optional: Custom ports
PORT=3000
SERVER_PORT=3001
```

## 🚀 Running the Application

### 1. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
```

### 2. Process WhatsApp Payloads (Optional)
If you have WhatsApp webhook payloads to process:
```bash
cd scripts
npm start
```

This will:
- Read payload files from the `payloads/` directory
- Insert messages into MongoDB
- Update message statuses based on status payloads

### 3. Start the Backend API Server
```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

The API server will be available at `http://localhost:3001`

### 4. Start the Frontend Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📊 Database Schema

### Messages Collection (`processed_messages`)
```javascript
{
  _id: ObjectId,
  message_id: String,           // WhatsApp message ID
  meta_msg_id: String,          // Meta message ID
  from: String,                 // Sender phone number
  to: String,                   // Business phone number
  contact_name: String,         // Contact display name
  contact_wa_id: String,        // Contact WhatsApp ID
  message_type: String,         // Message type (text, image, etc.)
  message_body: String,         // Message content
  timestamp: Number,            // Unix timestamp
  status: String,               // received, sent, delivered, read
  conversation_id: String,      // Conversation identifier
  gs_app_id: String,            // GS App ID
  gs_id: String,                // GS ID (from status updates)
  created_at: Date,             // Original creation time
  processed_at: Date,           // Processing timestamp
  status_updated_at: Date,      // Last status update time
  last_status_timestamp: Number, // Last status timestamp
  payload_source: String        // Source payload type
}
```

## 🔧 API Endpoints

### Conversations
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:id/messages` - Get messages for a conversation
- `POST /api/conversations/:id/messages` - Send a new message

### Statistics
- `GET /api/stats` - Get conversation statistics
- `GET /api/health` - Health check endpoint

## 📁 Project Structure

```
whatsapp-web-clone/
├── src/
│   ├── components/
│   │   ├── WhatsAppDesktopLayout.tsx  # Main layout component
│   │   ├── ThemeProvider.tsx          # Theme management
│   │   └── ui/                        # Reusable UI components
│   ├── services/
│   │   └── whatsappService.js         # API service layer
│   └── ...
├── server/
│   ├── index.js                       # Express API server
│   └── package.json
├── scripts/
│   ├── process-whatsapp-payloads.js   # Payload processor
│   ├── test-processor.js              # Test script
│   └── package.json
├── payloads/                          # WhatsApp webhook payloads
└── ...
```

## 🎯 Usage

### Basic Usage
1. **Start the application** following the setup instructions above
2. **View conversations** in the left panel
3. **Click on a conversation** to view messages
4. **Send messages** using the input field at the bottom
5. **Toggle theme** using the moon/sun icon in the sidebar

### Advanced Features
- **Right-click messages** to access context menu (copy, forward, delete)
- **Use navigation icons** to switch between different sections
- **Search conversations** using the search bar
- **Filter conversations** by status (all, unread, favourites, groups)

### Mobile Experience
- **Responsive design** adapts to mobile screens
- **Touch-friendly** interface with proper spacing
- **Mobile navigation** with back buttons and menu options

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in environment variables
   - Verify network connectivity

2. **API Server Not Starting**
   - Check if port 3001 is available
   - Verify MongoDB connection
   - Check server logs for errors

3. **Frontend Not Loading Data**
   - Ensure API server is running
   - Check browser console for errors
   - Verify API endpoints are accessible

4. **Payload Processing Issues**
   - Ensure payload files are in the correct format
   - Check MongoDB connection
   - Verify file permissions

### Debug Mode
For detailed debugging:
- Check browser console for frontend errors
- Monitor server logs for backend issues
- Use the test script: `cd scripts && npm test`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI Components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Database: [MongoDB](https://www.mongodb.com/)
