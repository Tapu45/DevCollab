'use client';

import { Suspense } from 'react';
import ChatPage from './ChatPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPage />
    </Suspense>
  );
}
