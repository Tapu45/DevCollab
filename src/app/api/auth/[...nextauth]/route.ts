import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
import GitlabProvider from 'next-auth/providers/gitlab';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '../../../../generated/prisma';
import bcrypt from 'bcryptjs';
import { generateUserSuggestions } from '@/trigger/generateUserSuggestions';

const prisma = new PrismaClient();

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                emailOrUsername: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials) return null;
                const { emailOrUsername, password } = credentials;
                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: emailOrUsername },
                            { username: emailOrUsername }
                        ]
                    }
                });
                if (!user || !user.passwordHash) return null;
                const valid = await bcrypt.compare(password, user.passwordHash);
                if (!valid) return null;
                return { id: user.id, email: user.email, username: user.username, displayName: user.displayName, profilePictureUrl: user.profilePictureUrl };
            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: profile.name || profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                };
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                };
            }
        }),
        LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID!,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
        GitlabProvider({
            clientId: process.env.GITLAB_CLIENT_ID!,
            clientSecret: process.env.GITLAB_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: 'jwt' as const,
    },
    callbacks: {
        async session({ session, token }: { session: import("next-auth").Session; token: import("next-auth/jwt").JWT }) {
            if (token?.sub) {
                session.user = {
                    ...session.user,
                    id: token.sub,
                };
            }
            return session;
        },
    },
    events: {
        async signIn({ user }: { user: any }) {
            // Fire-and-forget; do not await to avoid slowing down login
            generateUserSuggestions.trigger({ userId: user.id }).catch(() => { });
        },
    },

};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };