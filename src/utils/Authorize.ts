import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getAuthSession(): Promise<Session | null> {
  return await getServerSession(authOptions) as Session | null;
}
