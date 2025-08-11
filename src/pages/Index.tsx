import { WhatsAppLayout } from '@/components/WhatsAppLayout';

const Index = () => {
  const guestUser = { id: 'guest', name: 'Guest', email: 'guest@example.com' };
  const handleLogout = () => {};
  return <WhatsAppLayout currentUser={guestUser} onLogout={handleLogout} />;
};

export default Index;
