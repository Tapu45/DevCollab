import axios from 'axios';
import { prisma } from '@/lib/Prisma';

interface LinkedInConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

interface LinkedInTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
}

interface LinkedInProfileData {
    id: string;
    firstName: {
        localized: Record<string, string>;
        preferredLocale: {
            country: string;
            language: string;
        };
    };
    lastName: {
        localized: Record<string, string>;
        preferredLocale: {
            country: string;
            language: string;
        };
    };
    headline?: {
        localized: Record<string, string>;
        preferredLocale: {
            country: string;
            language: string;
        };
    };
    summary?: {
        localized: Record<string, string>;
        preferredLocale: {
            country: string;
            language: string;
        };
    };
    industry?: string;
    location?: {
        country: string;
        geographicArea: string;
        city: string;
        postalCode: string;
    };
    profilePicture?: {
        displayImage: string;
    };
    vanityName?: string;
    publicProfileUrl?: string;
}

class LinkedInService {
    private config: LinkedInConfig;
    private baseUrl = 'https://api.linkedin.com/v2';

    constructor() {
        this.config = {
            clientId: process.env.LINKEDIN_CLIENT_ID!,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
            redirectUri: `${process.env.NEXTAUTH_URL}/api/linkedin/callback`,
        };
    }

    // Exchange authorization code for access token
    async exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
        const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
            grant_type: 'authorization_code',
            code,
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            redirect_uri: this.config.redirectUri,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return response.data;
    }

    // Refresh access token
    async refreshToken(refreshToken: string): Promise<LinkedInTokenResponse> {
        const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return response.data;
    }

    // Get user profile
    async getUserProfile(accessToken: string): Promise<LinkedInProfileData> {
        const response = await axios.get(`${this.baseUrl}/people/~`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
            },
            params: {
                projection: '(id,firstName,lastName,headline,summary,industry,location,profilePicture(displayImage~:playableStreams),vanityName,publicProfileUrl)',
            },
        });

        return response.data;
    }

    // Get user experiences
    async getUserExperiences(accessToken: string, personId: string): Promise<any[]> {
        const response = await axios.get(`${this.baseUrl}/people/${personId}/positions`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
            },
            params: {
                projection: '(elements*(id,title,company,location,description,startDate,endDate,isCurrent))',
            },
        });

        return response.data.elements || [];
    }

    // Get user education
    async getUserEducation(accessToken: string, personId: string): Promise<any[]> {
        const response = await axios.get(`${this.baseUrl}/people/${personId}/educations`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
            },
            params: {
                projection: '(elements*(id,schoolName,degree,fieldOfStudy,startDate,endDate,grade,activities,description))',
            },
        });

        return response.data.elements || [];
    }

    // Get user skills
    async getUserSkills(accessToken: string, personId: string): Promise<any[]> {
        const response = await axios.get(`${this.baseUrl}/people/${personId}/skills`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
            },
            params: {
                projection: '(elements*(id,name,endorsementCount))',
            },
        });

        return response.data.elements || [];
    }

    // Get user connections (limited by LinkedIn API)
    async getUserConnections(accessToken: string): Promise<any[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/people/~/connections`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                },
                params: {
                    projection: '(elements*(id,firstName,lastName,headline,profilePicture(displayImage~:playableStreams),publicProfileUrl))',
                },
            });

            return response.data.elements || [];
        } catch (error) {
            // LinkedIn API has restrictions on connections access
            console.log('Connections access limited by LinkedIn API');
            return [];
        }
    }

    // Get user posts (requires additional permissions)
    async getUserPosts(accessToken: string, personId: string): Promise<any[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/people/${personId}/shares`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                },
                params: {
                    projection: '(elements*(id,text,author,created,lastModified,content,distribution,subject))',
                },
            });

            return response.data.elements || [];
        } catch (error) {
            console.log('Posts access requires additional permissions');
            return [];
        }
    }

    // Sync LinkedIn profile for user
    async syncUserProfile(userId: string, accessToken: string): Promise<void> {
        try {
            // Get profile data
            const profileData = await this.getUserProfile(accessToken);

            // Get additional data
            const [experiences, educations, skills] = await Promise.all([
                this.getUserExperiences(accessToken, profileData.id),
                this.getUserEducation(accessToken, profileData.id),
                this.getUserSkills(accessToken, profileData.id),
            ]);

            // Create or update LinkedIn profile
            const linkedinProfile = await prisma.linkedInProfile.upsert({
                where: { linkedinId: profileData.id },
                update: {
                    userId,
                    firstName: profileData.firstName.localized[Object.keys(profileData.firstName.localized)[0]],
                    lastName: profileData.lastName.localized[Object.keys(profileData.lastName.localized)[0]],
                    headline: profileData.headline?.localized[Object.keys(profileData.headline.localized)[0]],
                    summary: profileData.summary?.localized[Object.keys(profileData.summary.localized)[0]],
                    industry: profileData.industry,
                    location: profileData.location ? `${profileData.location.city}, ${profileData.location.country}` : null,
                    profilePictureUrl: profileData.profilePicture?.displayImage,
                    publicProfileUrl: profileData.publicProfileUrl,
                    vanityName: profileData.vanityName,
                    lastSynced: new Date(),
                },
                create: {
                    userId,
                    linkedinId: profileData.id,
                    firstName: profileData.firstName.localized[Object.keys(profileData.firstName.localized)[0]],
                    lastName: profileData.lastName.localized[Object.keys(profileData.lastName.localized)[0]],
                    headline: profileData.headline?.localized[Object.keys(profileData.headline.localized)[0]],
                    summary: profileData.summary?.localized[Object.keys(profileData.summary.localized)[0]],
                    industry: profileData.industry,
                    location: profileData.location ? `${profileData.location.city}, ${profileData.location.country}` : null,
                    profilePictureUrl: profileData.profilePicture?.displayImage,
                    publicProfileUrl: profileData.publicProfileUrl ?? "",
                    vanityName: profileData.vanityName,
                    lastSynced: new Date(),
                },
            });

            // Sync experiences
            for (const exp of experiences) {
                await prisma.linkedInExperience.upsert({
                    where: { experienceId: exp.id },
                    update: {
                        title: exp.title,
                        companyName: exp.company?.name || '',
                        companyId: exp.company?.id,
                        location: exp.location?.name,
                        description: exp.description,
                        startDate: exp.startDate ? new Date(exp.startDate.year, exp.startDate.month - 1) : null,
                        endDate: exp.endDate ? new Date(exp.endDate.year, exp.endDate.month - 1) : null,
                        isCurrent: exp.isCurrent,
                        lastSynced: new Date(),
                    },
                    create: {
                        profileId: linkedinProfile.id,
                        experienceId: exp.id,
                        title: exp.title,
                        companyName: exp.company?.name || '',
                        companyId: exp.company?.id,
                        location: exp.location?.name,
                        description: exp.description,
                        startDate: exp.startDate ? new Date(exp.startDate.year, exp.startDate.month - 1) : null,
                        endDate: exp.endDate ? new Date(exp.endDate.year, exp.endDate.month - 1) : null,
                        isCurrent: exp.isCurrent,
                        lastSynced: new Date(),
                    },
                });
            }

            // Sync education
            for (const edu of educations) {
                await prisma.linkedInEducation.upsert({
                    where: { educationId: edu.id },
                    update: {
                        schoolName: edu.schoolName,
                        schoolId: edu.school?.id,
                        degree: edu.degree,
                        fieldOfStudy: edu.fieldOfStudy,
                        startDate: edu.startDate ? new Date(edu.startDate.year, edu.startDate.month - 1) : null,
                        endDate: edu.endDate ? new Date(edu.endDate.year, edu.endDate.month - 1) : null,
                        grade: edu.grade,
                        activities: edu.activities,
                        description: edu.description,
                        lastSynced: new Date(),
                    },
                    create: {
                        profileId: linkedinProfile.id,
                        educationId: edu.id,
                        schoolName: edu.schoolName,
                        schoolId: edu.school?.id,
                        degree: edu.degree,
                        fieldOfStudy: edu.fieldOfStudy,
                        startDate: edu.startDate ? new Date(edu.startDate.year, edu.startDate.month - 1) : null,
                        endDate: edu.endDate ? new Date(edu.endDate.year, edu.endDate.month - 1) : null,
                        grade: edu.grade,
                        activities: edu.activities,
                        description: edu.description,
                        lastSynced: new Date(),
                    },
                });
            }

            // Sync skills
            for (const skill of skills) {
                await prisma.linkedInSkill.upsert({
                    where: { skillId: skill.id },
                    update: {
                        name: skill.name,
                        endorsements: skill.endorsementCount || 0,
                        lastSynced: new Date(),
                    },
                    create: {
                        profileId: linkedinProfile.id,
                        skillId: skill.id,
                        name: skill.name,
                        endorsements: skill.endorsementCount || 0,
                        lastSynced: new Date(),
                    },
                });
            }

            // Try to sync connections (limited by API)
            try {
                const connections = await this.getUserConnections(accessToken);
                for (const conn of connections) {
                    await prisma.linkedInConnection.upsert({
                        where: { connectionId: conn.id },
                        update: {
                            firstName: conn.firstName,
                            lastName: conn.lastName,
                            headline: conn.headline,
                            profilePictureUrl: conn.profilePicture?.displayImage,
                            publicProfileUrl: conn.publicProfileUrl,
                            lastSynced: new Date(),
                        },
                        create: {
                            profileId: linkedinProfile.id,
                            connectionId: conn.id,
                            firstName: conn.firstName,
                            lastName: conn.lastName,
                            headline: conn.headline,
                            profilePictureUrl: conn.profilePicture?.displayImage,
                            publicProfileUrl: conn.publicProfileUrl,
                            lastSynced: new Date(),
                        },
                    });
                }
            } catch (error) {
                console.log('Could not sync connections:', error);
            }

            // Try to sync posts (requires additional permissions)
            try {
                const posts = await this.getUserPosts(accessToken, profileData.id);
                for (const post of posts) {
                    await prisma.linkedInPost.upsert({
                        where: { postId: post.id },
                        update: {
                            text: post.text,
                            authorName: post.author?.name,
                            authorHeadline: post.author?.headline,
                            authorProfileUrl: post.author?.publicProfileUrl,
                            authorPictureUrl: post.author?.profilePicture?.displayImage,
                            postType: post.content ? 'article' : 'text',
                            publishedAt: new Date(post.created.time),
                            lastSynced: new Date(),
                        },
                        create: {
                            profileId: linkedinProfile.id,
                            postId: post.id,
                            text: post.text,
                            authorName: post.author?.name,
                            authorHeadline: post.author?.headline,
                            authorProfileUrl: post.author?.publicProfileUrl,
                            authorPictureUrl: post.author?.profilePicture?.displayImage,
                            postType: post.content ? 'article' : 'text',
                            publishedAt: new Date(post.created.time),
                            lastSynced: new Date(),
                        },
                    });
                }
            } catch (error) {
                console.log('Could not sync posts:', error);
            }

        } catch (error) {
            console.error('LinkedIn profile sync error:', error);
            throw error;
        }
    }

    // Get comprehensive LinkedIn stats for user
    async getUserStats(userId: string): Promise<any> {
        const profile = await prisma.linkedInProfile.findFirst({
            where: { userId, isActive: true },
            include: {
                experiences: true,
                educations: true,
                skills: true,
                connections: true,
                posts: true,
            },
        });

        if (!profile) {
            return null;
        }

        const stats = {
            profile: {
                name: `${profile.firstName} ${profile.lastName}`,
                headline: profile.headline,
                industry: profile.industry,
                location: profile.location,
                profilePictureUrl: profile.profilePictureUrl,
                publicProfileUrl: profile.publicProfileUrl,
            },
            experiences: profile.experiences.length,
            educations: profile.educations.length,
            skills: profile.skills.length,
            connections: profile.connections.length,
            posts: profile.posts.length,
            topSkills: profile.skills
                .sort((a, b) => b.endorsements - a.endorsements)
                .slice(0, 10)
                .map(skill => ({ name: skill.name, endorsements: skill.endorsements })),
            currentExperience: profile.experiences.find(exp => exp.isCurrent),
            recentPosts: profile.posts
                .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
                .slice(0, 5),
            lastSynced: profile.lastSynced,
        };

        return stats;
    }

    // Generate LinkedIn OAuth URL
    generateAuthUrl(state: string): string {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            state,
            scope: 'r_liteprofile r_emailaddress r_basicprofile w_member_social',
        });

        return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    }

    // Disconnect LinkedIn profile
    async disconnectProfile(userId: string): Promise<void> {
        await prisma.linkedInProfile.updateMany({
            where: { userId },
            data: { isActive: false },
        });
    }
}

export const linkedinService = new LinkedInService();