'use client';

import { Suspense } from 'react';
import MessagesPageContent from './MessagesPageContent';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesPageContent />
    </Suspense>
  );
}


