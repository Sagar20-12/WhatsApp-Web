# WhatsApp Web UI Clone

A responsive web application UI inspired by WhatsApp Web, built with React, TypeScript, and Tailwind CSS.

## Features

- **Split-screen Interface**: Left sidebar for contacts and right panel for chat window
- **Responsive Design**: Mobile-first approach with adaptive layout
- **Contact List**: Shows profile pictures, names, last messages, timestamps, and unread counts
- **Chat Interface**: Real-time messaging with message bubbles, timestamps, and typing indicators
- **Modern UI**: Clean, flat design with WhatsApp's signature green color scheme
- **Interactive Elements**: Hover effects, smooth transitions, and responsive buttons

## Layout Components

### Left Sidebar (Contacts Panel)
- User profile header with status
- Search bar for finding contacts
- Scrollable contact list with:
  - Circular profile pictures
  - Contact names and last messages
  - Timestamps and unread message badges
  - Online status indicators

### Right Main Panel (Chat Window)
- Chat header with contact info and action buttons
- Messages area with:
  - Sent messages (green bubbles, right-aligned)
  - Received messages (white bubbles, left-aligned)
  - Message timestamps
  - Typing indicators
- Message input area with:
  - Text input field
  - Emoji, attachment, and voice recording buttons
  - Send button

## Technologies Used

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **Lucide React** for icons
- **Radix UI** primitives
- **Vite** for build tooling

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Email OTP setup

To enable email OTP, create a `.env` file in the project root with the following variables:

```
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
SMTP_FROM="Your App <no-reply@yourdomain.com>"

# optional for testing the SMTP script
TEST_EMAIL_TO=your_email@example.com
```

Then start the Socket/HTTP server that powers auth and sockets:

```
npm run socket:server
```

You can verify SMTP works by sending a test email:

```
npm run test:smtp
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Shadcn/ui components
│   └── WhatsAppLayout.tsx  # Main WhatsApp UI component
├── hooks/
│   └── use-mobile.tsx      # Mobile responsiveness hook
├── pages/
│   └── Index.tsx           # Main page component
└── index.css              # Global styles and WhatsApp-specific CSS
```

## Customization

The UI uses WhatsApp's signature colors:
- Primary Green: `#075E54`
- Accent Green: `#25D366`
- Background: `#ECE5DD`
- Message Bubbles: Green for sent, white for received

## Responsive Behavior

- **Desktop**: Side-by-side layout with fixed sidebar
- **Mobile**: Single panel view with navigation between contacts and chat
- **Tablet**: Adaptive layout that switches based on screen size

## Future Enhancements

- Real-time messaging with WebSocket
- File upload and sharing
- Voice messages
- Group chat functionality
- Dark mode support
- Message reactions and replies
