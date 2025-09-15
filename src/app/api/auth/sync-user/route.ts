import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { generateUserSuggestions } from "@/trigger/generateUserSuggestions";

export async function POST(req: NextRequest) {
    try {
        const { clerkId, email, firstName, lastName, imageUrl, username } = await req.json();

        if (!clerkId || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user exists by clerkId or email
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: clerkId },
                    { email: email }
                ]
            },
        });

        const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || email.split('@')[0];
        let isNewUser = false;

        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    id: clerkId,
                    email: email,
                    username: username || email.split('@')[0],
                    displayName: displayName,
                    firstName: firstName,
                    lastName: lastName,
                    profilePictureUrl: imageUrl,
                    emailVerified: new Date(),
                },
            });
            isNewUser = true;
        } else {
            // Update existing user
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    id: clerkId,
                    displayName: displayName,
                    firstName: firstName || user.firstName,
                    lastName: lastName || user.lastName,
                    profilePictureUrl: imageUrl || user.profilePictureUrl,
                    emailVerified: new Date(),
                },
            });
        }

        // Trigger suggestions only for new users
        if (isNewUser) {
            try {
                await generateUserSuggestions.trigger({ userId: clerkId });
                console.log(`Triggered suggestions for new user: ${clerkId}`);
            } catch (error) {
                console.error('Failed to trigger suggestions for new user:', error);
                // Don't fail the sync if suggestions fail
            }
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('User sync error:', error);
        return NextResponse.json(
            { error: 'Failed to sync user' },
            { status: 500 }
        );
    }
}