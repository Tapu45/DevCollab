import { prisma } from '@/lib/Prisma';

export async function validateConnectionRequest(senderId: string, receiverId: string) {
  // Fetch receiver's connection privacy settings
  const privacy = await prisma.connectionPrivacy.findUnique({
    where: { userId: receiverId },
    select: {
      connectionRequestLevel: true,
      autoDeclineRequests: true,
      blockedUserIds: true
    }
  });

  if (!privacy) {
    // Default: allow if no privacy settings found
    return true;
  }

  if (privacy.blockedUserIds.includes(senderId)) {
    return false;
  }

  if (privacy.autoDeclineRequests) {
    return false;
  }

  switch (privacy.connectionRequestLevel) {
    case 'NOBODY':
      return false;
    case 'CONNECTIONS_ONLY':
      // Check if sender is already a connection
      const existingConnection = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId, receiverId, status: 'ACCEPTED' },
            { senderId: receiverId, receiverId: senderId, status: 'ACCEPTED' }
          ]
        }
      });
      return !!existingConnection;
    case 'VERIFIED_ONLY':
      // Check if sender is verified
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { emailVerified: true }
      });
      return !!sender?.emailVerified;
    default:
      return true;
  }
}