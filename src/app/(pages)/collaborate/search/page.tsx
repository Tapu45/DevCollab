'use client';

import { Suspense } from 'react';
import CollaborateSearchPage from './CollaborateSearchPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollaborateSearchPage />
    </Suspense>
  );
}


