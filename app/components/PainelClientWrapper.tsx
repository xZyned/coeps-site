'use client';

import { UserProvider } from '@/lib/auth0-client';

export default function PainelClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}