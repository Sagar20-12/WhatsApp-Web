import { WhatsAppDesktopLayout } from '@/components/WhatsAppDesktopLayout';

const Index = () => {
  const guestUser = { id: 'guest', name: 'Guest', email: 'guest@example.com' };
  const handleLogout = () => {};
  return <WhatsAppDesktopLayout currentUser={guestUser} onLogout={handleLogout} />;
};

export default Index;
