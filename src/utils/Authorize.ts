import { auth } from '@clerk/nextjs/server';

export async function getAuthSession(): Promise<{ user: { id: string } } | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  return { user: { id: userId } };
}