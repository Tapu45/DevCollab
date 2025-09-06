import { PrismaClient, UserRole, AccountType, SkillCategory, ProjectStatus, ProjectVisibility } from '../../src/generated/prisma/index.js';
import { hash } from 'bcryptjs';
import { generateUserEmbedding } from '../../src/utils/Cohere.js';
import { storeUserEmbedding } from '../../src/utils/Pinecone.js';
import { extractUserProfileData } from '../../src/utils/ProfileExtractor.js';

const prisma = new PrismaClient({
    log: ['error', 'warn']
});

// Tech stack options
const programmingLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin'];
const frameworks = ['React', 'Next.js', 'Vue.js', 'Angular', 'Django', 'Flask', 'Express', 'Spring Boot', 'ASP.NET', 'Laravel', 'Ruby on Rails'];
const databases = ['PostgreSQL', 'MongoDB', 'MySQL', 'Firebase', 'Redis', 'Supabase', 'DynamoDB', 'Cassandra', 'Neo4j'];
const cloud = ['AWS', 'Azure', 'Google Cloud', 'Vercel', 'Netlify', 'Digital Ocean', 'Heroku'];
const devOpsTools = ['Docker', 'Kubernetes', 'GitHub Actions', 'Jenkins', 'CircleCI', 'Terraform', 'Ansible'];
const universities = [
    'MIT', 'Stanford University', 'Carnegie Mellon University', 'UC Berkeley',
    'Georgia Tech', 'University of Washington', 'Purdue University', 'University of Illinois',
    'University of Texas', 'University of Michigan', 'Cornell University'
];
const companies = [
    'Google', 'Microsoft', 'Meta', 'Amazon', 'Apple', 'Spotify', 'Netflix',
    'Airbnb', 'Uber', 'Stripe', 'Shopify', 'Twitter', 'LinkedIn', 'PayPal',
    'Slack', 'Figma', 'Notion', 'Dropbox', 'Adobe', 'IBM', 'Intel', 'Oracle'
];
const timezones = [
    'America/Los_Angeles', 'America/New_York', 'America/Chicago', 'Europe/London',
    'Europe/Berlin', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney',
    'Asia/Kolkata', 'America/Toronto', 'Europe/Paris'
];
const locations = [
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
    'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO',
    'London, UK', 'Berlin, Germany', 'Toronto, Canada', 'Sydney, Australia',
    'Bangalore, India', 'Tokyo, Japan', 'Remote'
];
const projectNames = [
    'DevTracker', 'CodeCollab', 'CloudNotes', 'TaskFlow', 'DataViz',
    'APIBuilder', 'WebPortfolio', 'SmartShop', 'DevJournal', 'TechConnect',
    'StackOverflow Clone', 'E-commerce Platform', 'Social Media App',
    'Fitness Tracker', 'Recipe Finder', 'Weather Dashboard', 'Chat Application',
    'Personal Finance Manager', 'Movie Database', 'Learning Management System'
];

// Helper: Generate random skills
const generateSkills = (userId: string) => {
    const skills = [];
    const langCount = 2 + Math.floor(Math.random() * 3);
    const selectedLangs = [...programmingLanguages].sort(() => 0.5 - Math.random()).slice(0, langCount);
    for (const lang of selectedLangs) {
        skills.push({
            userId,
            name: lang,
            category: SkillCategory.PROGRAMMING_LANGUAGE,
            proficiencyLevel: 5 + Math.floor(Math.random() * 6),
            isVerified: Math.random() > 0.7,
            yearsExperience: 1 + Math.floor(Math.random() * 8)
        });
    }
    const frameworkCount = 2 + Math.floor(Math.random() * 3);
    const selectedFrameworks = [...frameworks].sort(() => 0.5 - Math.random()).slice(0, frameworkCount);
    for (const framework of selectedFrameworks) {
        skills.push({
            userId,
            name: framework,
            category: SkillCategory.FRAMEWORK,
            proficiencyLevel: 5 + Math.floor(Math.random() * 6),
            isVerified: Math.random() > 0.7,
            yearsExperience: 1 + Math.floor(Math.random() * 5)
        });
    }
    const dbCount = 1 + Math.floor(Math.random() * 2);
    const selectedDbs = [...databases].sort(() => 0.5 - Math.random()).slice(0, dbCount);
    for (const db of selectedDbs) {
        skills.push({
            userId,
            name: db,
            category: SkillCategory.DATABASE,
            proficiencyLevel: 5 + Math.floor(Math.random() * 6),
            isVerified: Math.random() > 0.7,
            yearsExperience: 1 + Math.floor(Math.random() * 4)
        });
    }
    const cloudCount = 1 + Math.floor(Math.random() * 2);
    const selectedCloud = [...cloud].sort(() => 0.5 - Math.random()).slice(0, cloudCount);
    for (const platform of selectedCloud) {
        skills.push({
            userId,
            name: platform,
            category: SkillCategory.CLOUD_PLATFORM,
            proficiencyLevel: 5 + Math.floor(Math.random() * 6),
            isVerified: Math.random() > 0.7,
            yearsExperience: 1 + Math.floor(Math.random() * 3)
        });
    }
    const devOpsCount = 1 + Math.floor(Math.random() * 2);
    const selectedDevOps = [...devOpsTools].sort(() => 0.5 - Math.random()).slice(0, devOpsCount);
    for (const tool of selectedDevOps) {
        skills.push({
            userId,
            name: tool,
            category: SkillCategory.DEVOPS_TOOL,
            proficiencyLevel: 5 + Math.floor(Math.random() * 6),
            isVerified: Math.random() > 0.7,
            yearsExperience: 1 + Math.floor(Math.random() * 3)
        });
    }
    return skills;
};

// Helper: Generate random experiences
const generateExperiences = (userId: string) => {
    const experienceCount = 1 + Math.floor(Math.random() * 3);
    const experiences = [];
    for (let i = 0; i < experienceCount; i++) {
        const companyName = companies[Math.floor(Math.random() * companies.length)];
        const startYear = 2018 - i * 2 - Math.floor(Math.random() * 2);
        const endYear = i === 0 ? null : startYear + 1 + Math.floor(Math.random() * 2);
        const positions = ['Software Engineer', 'Frontend Developer', 'Backend Developer',
            'Full Stack Developer', 'DevOps Engineer', 'Data Engineer',
            'Product Engineer', 'Mobile Developer', 'UI Engineer'];
        const position = positions[Math.floor(Math.random() * positions.length)];
        experiences.push({
            userId,
            company: companyName,
            title: position,
            startDate: new Date(startYear, Math.floor(Math.random() * 12), 1),
            endDate: endYear ? new Date(endYear, Math.floor(Math.random() * 12), 1) : null,
            isCurrent: endYear === null,
            responsibilities: `Worked on various ${position.toLowerCase()} tasks and projects at ${companyName}. Developed new features, fixed bugs, and collaborated with cross-functional teams. Implemented best practices and contributed to improving code quality.`,
            location: locations[Math.floor(Math.random() * locations.length)],
        });
    }
    return experiences;
};

// Helper: Generate random education
const generateEducation = (userId: string) => {
    const university = universities[Math.floor(Math.random() * universities.length)];
    const graduationYear = 2015 + Math.floor(Math.random() * 8);
    const degrees = [
        'Bachelor of Science in Computer Science',
        'Master of Science in Computer Science',
        'Bachelor of Science in Software Engineering',
        'Bachelor of Engineering in Computer Science',
        'Master of Computer Applications',
        'Bachelor of Science in Information Technology'
    ];
    return [{
        userId,
        institution: university,
        degree: degrees[Math.floor(Math.random() * degrees.length)],
        fieldOfStudy: 'Computer Science',
        startDate: new Date(graduationYear - 4, 8, 1),
        endDate: new Date(graduationYear, 5, 15),
        description: `Studied computer science fundamentals, algorithms, data structures, and software engineering at ${university}. Participated in various hackathons and coding competitions. Worked on several team projects using modern technologies.`,
        grade: ['3.7/4.0', '3.8/4.0', '3.5/4.0', '3.9/4.0'][Math.floor(Math.random() * 4)]
    }];
};

// Helper: Generate random projects
const generateProjects = (userId: string) => {
    const projectCount = 1 + Math.floor(Math.random() * 3);
    const projects = [];

    for (let i = 0; i < projectCount; i++) {
        const projectName = projectNames[Math.floor(Math.random() * projectNames.length)] + ' ' + Math.floor(Math.random() * 100);
        const techStack = [];

        // Add 2-4 random languages/frameworks to tech stack
        const allTech = [...programmingLanguages, ...frameworks, ...databases];
        const techCount = 2 + Math.floor(Math.random() * 3);
        const selectedTech = [...allTech].sort(() => 0.5 - Math.random()).slice(0, techCount);

        // Project categories and tags
        const categories = ['Web Development', 'Mobile App', 'Data Science', 'DevOps', 'Machine Learning']
            .sort(() => 0.5 - Math.random())
            .slice(0, 1 + Math.floor(Math.random() * 2));

        const tags = ['Responsive', 'API', 'UI/UX', 'SPA', 'PWA', 'Full-stack', 'Backend', 'Frontend']
            .sort(() => 0.5 - Math.random())
            .slice(0, 2 + Math.floor(Math.random() * 3));

        // Generate random skills required
        const requiredSkills = [...programmingLanguages, ...frameworks]
            .sort(() => 0.5 - Math.random())
            .slice(0, 2 + Math.floor(Math.random() * 3));

        projects.push({
            ownerId: userId,
            title: projectName,
            description: `A ${categories[0].toLowerCase()} project built with ${selectedTech.join(', ')}. Features include user authentication, data visualization, and responsive design.`,
            shortDesc: `${projectName}: A ${categories[0].toLowerCase()} project built with ${selectedTech[0]} and ${selectedTech[1] || selectedTech[0]}.`,
            status: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'][Math.floor(Math.random() * 4)] as ProjectStatus,
            visibility: ['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY'][Math.floor(Math.random() * 3)] as ProjectVisibility,
            techStack: selectedTech,
            categories,
            tags,
            difficultyLevel: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'][Math.floor(Math.random() * 3)],
            estimatedHours: 20 + Math.floor(Math.random() * 100),
            maxCollaborators: 3 + Math.floor(Math.random() * 5),
            githubUrl: `https://github.com/seeduser/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
            liveUrl: Math.random() > 0.5 ? `https://${projectName.toLowerCase().replace(/\s+/g, '-')}.example.com` : null,
            designUrl: Math.random() > 0.7 ? `https://figma.com/file/${projectName.toLowerCase().replace(/\s+/g, '-')}` : null,
            documentUrl: Math.random() > 0.7 ? `https://docs.google.com/document/${projectName.toLowerCase().replace(/\s+/g, '-')}` : null,
            thumbnailUrl: `https://picsum.photos/seed/${projectName.toLowerCase().replace(/\s+/g, '')}/300/200`,
            images: Array(Math.floor(Math.random() * 3)).fill('').map((_, i) =>
                `https://picsum.photos/seed/${projectName.toLowerCase().replace(/\s+/g, '')}-${i}/800/600`
            ),
            isRecruiting: Math.random() > 0.5,
            recruitmentMsg: Math.random() > 0.5 ? `Looking for ${requiredSkills[0]} developers to join this project. Experience with ${requiredSkills[1] || requiredSkills[0]} preferred.` : null,
            requiredSkills,
            preferredTimezone: timezones[Math.floor(Math.random() * timezones.length)],
        });
    }

    return projects;
};

// Helper: Validate user profile completeness
function validateProfile(user: any, skills: any[], experiences: any[], education: any[], projects: any[]) {
    if (!user || !user.id || !user.email || !user.username) return false;
    if (!skills || skills.length < 3) return false;
    if (!experiences || experiences.length < 1) return false;
    if (!education || education.length < 1) return false;
    if (!projects || projects.length < 1) return false;
    return true;
}

// Helper: Retry wrapper for async functions
async function retryAsync(fn: () => Promise<any>, retries = 3, delay = 1000) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            await new Promise(res => setTimeout(res, delay));
        }
    }
    throw lastError;
}

// Store profile in Pinecone with error handling and retries
async function storeProfileInPinecone(user: any) {
    try {
        const profileData = await extractUserProfileData(user.id);
        if (!profileData) throw new Error('Profile extraction failed');
        await retryAsync(() => generateUserEmbedding(user.id), 3, 1500);
        await retryAsync(() => storeUserEmbedding(user.id), 3, 1500);
        console.log(`Stored embedding for seed user: ${user.email}`);
        return true;
    } catch (err) {
        console.error(`Failed to store embedding for ${user.email}:`, err);
        return false;
    }
}

// Helper to generate a random profile progress
const generateProfileProgress = (userId: string) => {
    return {
        userId,
        currentSection: ['basic', 'education', 'experience', 'project', 'skills'][Math.floor(Math.random() * 5)],
        lastUpdated: new Date()
    };
};

// Main seeding function with transaction and edge case tests
async function seedUsers() {
    console.log('Seeding users with profiles...');
    const passwordHash = await hash('SeedUser123!', 12);
    const failedUsers: string[] = [];
    const duplicateEmails = new Set<string>();
    const duplicateUsernames = new Set<string>();

    for (let i = 2; i <= 30; i++) {
        const email = `seeduser${i}@EMAIL.COM`;
        const username = `seeddev${i}`;
        // Edge case: duplicate email/username
        if (duplicateEmails.has(email) || duplicateUsernames.has(username)) {
            console.error(`Duplicate email/username detected: ${email}, ${username}`);
            failedUsers.push(email);
            continue;
        }
        duplicateEmails.add(email);
        duplicateUsernames.add(username);

        let createdUser: Awaited<ReturnType<typeof prisma.user.create>> | undefined;
        try {
            // Database transaction (only core operations)
            await prisma.$transaction(async (tx) => {
                // Create or update user
                const firstName = ['Alex', 'Jamie', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Dakota'][Math.floor(Math.random() * 10)];
                const lastName = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'][Math.floor(Math.random() * 10)];
                const location = locations[Math.floor(Math.random() * locations.length)];
                const randomLanguage = programmingLanguages[Math.floor(Math.random() * programmingLanguages.length)];
                const randomFramework = frameworks[Math.floor(Math.random() * frameworks.length)];

                const user = await tx.user.upsert({
                    where: { email },
                    update: {
                        profileCompleted: true,
                    },
                    create: {
                        email,
                        username,
                        passwordHash,
                        firstName,
                        lastName,
                        displayName: `${firstName} ${lastName}`,
                        profilePictureUrl: `https://i.pravatar.cc/300?img=${i + 10}`,
                        bio: `I'm a developer with experience in ${randomLanguage} and ${randomFramework}. Looking to collaborate on interesting projects and learn new technologies.`,
                        location,
                        timezone: timezones[Math.floor(Math.random() * timezones.length)],
                        website: Math.random() > 0.6 ? `https://${username}.dev` : null,
                        githubUrl: `https://github.com/${username}`,
                        linkedinUrl: `https://linkedin.com/in/${username}`,
                        role: UserRole.USER,
                        accountType: AccountType.INDIVIDUAL,
                        isActive: true,
                        isBanned: false,
                        bannedUntil: null,
                        banReason: null,
                        profileVisibility: ['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY'][Math.floor(Math.random() * 3)],
                        showEmail: Math.random() > 0.7,
                        showLocation: Math.random() > 0.2,
                        allowMessages: Math.random() > 0.1,
                        profileCompleted: true,
                        emailVerified: new Date(),
                        reputationScore: Math.floor(Math.random() * 500),
                        totalContributions: Math.floor(Math.random() * 200),
                    }
                });

                createdUser = user;

                // Create skills, experiences, education, projects (with skipDuplicates to avoid conflicts)
                await tx.skill.createMany({
                    data: generateSkills(user.id),
                    skipDuplicates: true
                });
                await tx.experience.createMany({
                    data: generateExperiences(user.id),
                    skipDuplicates: true
                });
                await tx.education.createMany({
                    data: generateEducation(user.id),
                    skipDuplicates: true
                });
                await tx.project.createMany({
                    data: generateProjects(user.id)
                });

                // Upsert profile progress
                await tx.profileProgress.upsert({
                    where: { userId: user.id },
                    update: { lastUpdated: new Date() },
                    create: generateProfileProgress(user.id)
                });
            }, { timeout: 20000 }); // Increased timeout for safety

            // Outside transaction: Handle achievements, endorsements, etc.
            if (createdUser) {
                // Seed achievements (create if not exist, then assign)
                let achievements = await prisma.achievement.findMany({ take: 3 });
                if (achievements.length === 0) {
                    achievements = await Promise.all([
                        prisma.achievement.create({
                            data: {
                                name: 'First Project',
                                description: 'Created your first project!',
                                icon: '🚀',
                                category: 'Milestone',
                                points: 10,
                                criteria: { type: 'project_created' }
                            }
                        }),
                        prisma.achievement.create({
                            data: {
                                name: 'Profile Complete',
                                description: 'Completed your profile.',
                                icon: '✅',
                                category: 'Profile',
                                points: 5,
                                criteria: { type: 'profile_completed' }
                            }
                        }),
                        prisma.achievement.create({
                            data: {
                                name: 'First Connection',
                                description: 'Made your first connection.',
                                icon: '🤝',
                                category: 'Networking',
                                points: 5,
                                criteria: { type: 'connection_made' }
                            }
                        })
                    ]);
                }
                for (const ach of achievements) {
                    await prisma.userAchievement.upsert({
                        where: { userId_achievementId: { userId: createdUser.id, achievementId: ach.id } },
                        update: {},
                        create: {
                            userId: createdUser.id,
                            achievementId: ach.id,
                            unlockedAt: new Date()
                        }
                    });
                }

                // Seed endorsements
                const userSkills = await prisma.skill.findMany({ where: { userId: createdUser.id } });
                for (const skill of userSkills.slice(0, 2)) {
                    await prisma.endorsement.upsert({
                        where: { skillId_giverId: { skillId: skill.id, giverId: createdUser.id } },
                        update: {},
                        create: {
                            skillId: skill.id,
                            giverId: createdUser.id,
                            receiverId: createdUser.id,
                            message: `Endorsed for ${skill.name}!`
                        }
                    });
                }

                // Upsert connection privacy
                await prisma.connectionPrivacy.upsert({
                    where: { userId: createdUser.id },
                    update: {},
                    create: {
                        userId: createdUser.id,
                        connectionPrivacyLevel: 'EVERYONE',
                        connectionRequestLevel: 'EVERYONE',
                        hideConnections: false,
                        autoDeclineRequests: false,
                        blockedUserIds: []
                    }
                });

                // Upsert notification preferences
                await prisma.notificationPreference.upsert({
                    where: { userId_category: { userId: createdUser.id, category: 'SYSTEM' } },
                    update: {},
                    create: {
                        userId: createdUser.id,
                        category: 'SYSTEM',
                        inAppEnabled: true,
                        emailEnabled: Math.random() > 0.5,
                        pushEnabled: Math.random() > 0.5,
                        smsEnabled: false,
                        digestFrequency: 'DAILY',
                        timezone: createdUser.timezone || 'UTC'
                    }
                });

                // Upsert user suggestion cache
                await prisma.userSuggestionCache.upsert({
                    where: { userId: createdUser.id },
                    update: { updatedAt: new Date() },
                    create: {
                        userId: createdUser.id,
                        data: { suggestions: [] },
                        updatedAt: new Date()
                    }
                });

                // Seed recent activity
                const actions = ['LOGIN', 'PROFILE_UPDATE', 'PROJECT_CREATE', 'CONNECTION_ACCEPT', 'SKILL_ADD'];
                for (let j = 0; j < 2 + Math.floor(Math.random() * 3); j++) {
                    await prisma.userActivity.create({
                        data: {
                            userId: createdUser.id,
                            action: actions[Math.floor(Math.random() * actions.length)],
                            resource: null,
                            metadata: {},
                            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                            userAgent: 'Mozilla/5.0'
                        }
                    });
                }

                // Store profile in Pinecone
                const pineconeSuccess = await storeProfileInPinecone(createdUser);
                if (!pineconeSuccess) {
                    console.warn(`Embedding failed for ${createdUser.email}, but user updated.`);
                }
                console.log(`Updated seed user ${i}: ${createdUser.email}`);
            }

        } catch (error: any) {
            console.error(`Error updating seed user ${i} (${email}):`, error.message || error);
            failedUsers.push(email);
        }
    }

    // Summary logging
    console.log('Completed seeding/updating users with profiles');
    if (failedUsers.length > 0) {
        console.error(`Failed to seed/update ${failedUsers.length} users:`, failedUsers);
    } else {
        console.log('All users seeded/updated successfully!');
    }
}

export { seedUsers };

// Run this file directly using ts-node if needed
if (import.meta.url === process.argv[1] || import.meta.url === `file://${process.argv[1]}`) {
    seedUsers()
        .then(() => console.log('Seeding completed'))
        .catch(e => console.error('Error during seeding:', e))
        .finally(() => prisma.$disconnect());
}