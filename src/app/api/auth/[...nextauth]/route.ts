import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
import GitlabProvider from 'next-auth/providers/gitlab';
import { prisma } from '@/lib/Prisma';
import bcrypt from 'bcryptjs';
import { generateUserSuggestions } from '@/trigger/generateUserSuggestions';
import { Session, User } from 'next-auth';

export const authOptions = {
    // Remove PrismaAdapter for JWT strategy
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                emailOrUsername: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                console.log("Credentials received:", credentials);
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
                console.log("User found:", user);
                if (!user || !user.passwordHash) return null;
                const valid = await bcrypt.compare(password, user.passwordHash);
                console.log("Password valid:", valid);
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
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
            // Persist the OAuth access_token and or the user id to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
            }
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.username = user.username;
                token.displayName = user.displayName;
                token.profilePictureUrl = user.profilePictureUrl;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: any }) {
            // Send properties to the client
            if (token) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.name = token.displayName || token.username;
                session.user.image = token.profilePictureUrl;
            }
            return session;
        },
        async signIn({ user, account, profile, email, credentials }: {
            user: any;
            account: any;
            profile?: any;
            email?: { verificationRequest?: boolean } | undefined;
            credentials?: Record<string, unknown>;
        }) {
            return true;
        },
    },
    events: {
        async signIn({ user, account, profile, isNewUser }: {
            user: any;
            account: any;
            profile?: any;
            isNewUser?: boolean;
        }) {
            // Fire-and-forget; do not await to avoid slowing down login
            generateUserSuggestions.trigger({ userId: user.id }).catch(() => { });
        },
    },
    pages: {
        signIn: '/auth/login',
        signOut: '/auth/logout',
        error: '/auth/error',
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };