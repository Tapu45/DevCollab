// prisma/seed/SeedUserFromEmail.ts
import { PrismaClient, UserRole, AccountType, SkillCategory, ProjectStatus, ProjectVisibility } from '../../src/generated/prisma/index.js';
import { generateUserEmbedding } from '../../src/utils/Cohere.js';
import { storeUserEmbedding } from '../../src/utils/Pinecone.js';
import { extractUserProfileData } from '../../src/utils/ProfileExtractor.js';

const prisma = new PrismaClient({ log: ['error', 'warn'] });

// Tech stack and sample data pools (reused from main seeder)
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

// Utilities
const rand = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randBool = (p = 0.5) => Math.random() < p;
const uniqueSlug = (base: string) => `${base}${Math.floor(Math.random() * 10000)}`;

// Data generators (aligned with main seeder)
const generateSkills = (userId: string) => {
    const skills: any[] = [];
    const langCount = 2 + Math.floor(Math.random() * 3);
    const selectedLangs = [...programmingLanguages].sort(() => 0.5 - Math.random()).slice(0, langCount);
    for (const lang of selectedLangs) {
        skills.push({
            userId,
            name: lang,
            category: SkillCategory.PROGRAMMING_LANGUAGE,
            proficiencyLevel: 5 + Math.floor(Math.random() * 6),
            isVerified: randBool(0.3),
            yearsExperience: 1 + Math.floor(Math.random() * 8),
        });
    }
    const frameworkCount = 2 + Math.floor(Math.random() * 3);
    const selectedFrameworks = [...frameworks].sort(() => 0.5 - Math.random()).slice(0, frameworkCount);
    for (const fw of selectedFrameworks) {
        skills.push({
            userId,
            name: fw,
            category: SkillCategory.FRAMEWORK,
            proficiencyLevel: 5 + Math.floor(Math.random() * 6),
            isVerified: randBool(0.3),
            yearsExperience: 1 + Math.floor(Math.random() * 5),
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
            isVerified: randBool(0.3),
            yearsExperience: 1 + Math.floor(Math.random() * 4),
        });
    }
    const cloudCount = 1 + Math.floor(Math.random() * 2);
    const selectedCloud = [...cloud].sort(() => 0.5 - Math.random()).slice(0, cloudCount);
    for (const c of selectedCloud) {
        skills.push({
            userId,
            name: c,
            category: SkillCategory.CLOUD_PLATFORM,
            proficiencyLevel: 5 + Math.floor(Math.random() * 6),
            isVerified: randBool(0.3),
            yearsExperience: 1 + Math.floor(Math.random() * 3),
        });
    }
    const devOpsCount = 1 + Math.floor(Math.random() * 2);
    const selectedDevOps = [...devOpsTools].sort(() => 0.5 - Math.random()).slice(0, devOpsCount);
    for (const t of selectedDevOps) {
        skills.push({
            userId,
            name: t,
            category: SkillCategory.DEVOPS_TOOL,
            proficiencyLevel: 5 + Math.floor(Math.random() * 6),
            isVerified: randBool(0.3),
            yearsExperience: 1 + Math.floor(Math.random() * 3),
        });
    }
    return skills;
};

const generateExperiences = (userId: string) => {
    const count = 1 + Math.floor(Math.random() * 3);
    const experiences: any[] = [];
    for (let i = 0; i < count; i++) {
        const company = rand(companies);
        const startYear = 2018 - i * 2 - Math.floor(Math.random() * 2);
        const endYear = i === 0 ? null : startYear + 1 + Math.floor(Math.random() * 2);
        const positions = ['Software Engineer', 'Frontend Developer', 'Backend Developer',
            'Full Stack Developer', 'DevOps Engineer', 'Data Engineer',
            'Product Engineer', 'Mobile Developer', 'UI Engineer'];
        const title = rand(positions);
        experiences.push({
            userId,
            company,
            title,
            startDate: new Date(startYear, Math.floor(Math.random() * 12), 1),
            endDate: endYear ? new Date(endYear, Math.floor(Math.random() * 12), 1) : null,
            isCurrent: endYear === null,
            responsibilities: `Worked on various ${title.toLowerCase()} tasks and projects at ${company}. Developed features, fixed bugs, and collaborated with cross-functional teams.`,
            location: rand(locations),
        });
    }
    return experiences;
};

const generateEducation = (userId: string) => {
    const university = rand(universities);
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
        degree: rand(degrees),
        fieldOfStudy: 'Computer Science',
        startDate: new Date(graduationYear - 4, 8, 1),
        endDate: new Date(graduationYear, 5, 15),
        description: `Studied CS fundamentals, algorithms, data structures, and software engineering at ${university}. Participated in hackathons and team projects.`,
        grade: rand(['3.7/4.0', '3.8/4.0', '3.5/4.0', '3.9/4.0']),
    }];
};

const generateProjects = (userId: string) => {
    const count = 1 + Math.floor(Math.random() * 3);
    const projects: any[] = [];
    for (let i = 0; i < count; i++) {
        const projectName = `${rand(projectNames)} ${Math.floor(Math.random() * 100)}`;
        const allTech = [...programmingLanguages, ...frameworks, ...databases];
        const techCount = 2 + Math.floor(Math.random() * 3);
        const selectedTech = [...allTech].sort(() => 0.5 - Math.random()).slice(0, techCount);
        const categories = ['Web Development', 'Mobile App', 'Data Science', 'DevOps', 'Machine Learning']
            .sort(() => 0.5 - Math.random()).slice(0, 1 + Math.floor(Math.random() * 2));
        const tags = ['Responsive', 'API', 'UI/UX', 'SPA', 'PWA', 'Full-stack', 'Backend', 'Frontend']
            .sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 3));
        const requiredSkills = [...programmingLanguages, ...frameworks]
            .sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 3));

        projects.push({
            ownerId: userId,
            title: projectName,
            description: `A ${categories[0].toLowerCase()} project built with ${selectedTech.join(', ')}.`,
            shortDesc: `${projectName}: A ${categories[0].toLowerCase()} project built with ${selectedTech[0]} and ${selectedTech[1] || selectedTech[0]}.`,
            status: rand(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']) as ProjectStatus,
            visibility: rand(['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY']) as ProjectVisibility,
            techStack: selectedTech,
            categories,
            tags,
            difficultyLevel: rand(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
            estimatedHours: 20 + Math.floor(Math.random() * 100),
            maxCollaborators: 3 + Math.floor(Math.random() * 5),
            githubUrl: `https://github.com/seeduser/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
            liveUrl: randBool(0.5) ? `https://${projectName.toLowerCase().replace(/\s+/g, '-')}.example.com` : null,
            designUrl: randBool(0.3) ? `https://figma.com/file/${projectName.toLowerCase().replace(/\s+/g, '-')}` : null,
            documentUrl: randBool(0.3) ? `https://docs.google.com/document/${projectName.toLowerCase().replace(/\s+/g, '-')}` : null,
            thumbnailUrl: `https://picsum.photos/seed/${projectName.toLowerCase().replace(/\s+/g, '')}/300/200`,
            images: Array(Math.floor(Math.random() * 3)).fill('').map((_, idx) =>
                `https://picsum.photos/seed/${projectName.toLowerCase().replace(/\s+/g, '')}-${idx}/800/600`
            ),
            isRecruiting: randBool(0.5),
            recruitmentMsg: randBool(0.5) ? `Looking for ${requiredSkills[0]} developers. Experience with ${requiredSkills[1] || requiredSkills[0]} preferred.` : null,
            requiredSkills,
            preferredTimezone: rand(timezones),
        });
    }
    return projects;
};

function usernameFromEmail(email: string) {
    const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || 'user';
    return uniqueSlug(base.toLowerCase());
}

async function seedOne(email: string) {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;

    // Create or update user + full profile (no password)
    let createdUser: Awaited<ReturnType<typeof prisma.user.create>> | undefined;

    await prisma.$transaction(async (tx) => {
        const firstNames = ['Alex', 'Jamie', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Dakota'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
        const firstName = rand(firstNames);
        const lastName = rand(lastNames);
        const location = rand(locations);
        const randomLanguage = rand(programmingLanguages);
        const randomFramework = rand(frameworks);
        const username = usernameFromEmail(normalizedEmail);

        const existing = await tx.user.findUnique({ where: { email: normalizedEmail } });

        const user = await tx.user.upsert({
            where: { email: normalizedEmail },
            update: {
                profileCompleted: true,
                displayName: existing?.displayName || `${firstName} ${lastName}`,
                profilePictureUrl: existing?.profilePictureUrl || `https://i.pravatar.cc/300?u=${encodeURIComponent(normalizedEmail)}`,
                location: existing?.location || location,
                timezone: existing?.timezone || rand(timezones),
                website: existing?.website || (randBool(0.6) ? `https://${username}.dev` : null),
                githubUrl: existing?.githubUrl || `https://github.com/${username}`,
                linkedinUrl: existing?.linkedinUrl || `https://linkedin.com/in/${username}`,
                emailVerified: existing?.emailVerified || new Date(),
                reputationScore: existing?.reputationScore ?? Math.floor(Math.random() * 500),
                totalContributions: existing?.totalContributions ?? Math.floor(Math.random() * 200),
            },
            create: {
                email: normalizedEmail,
                username,
                firstName,
                lastName,
                displayName: `${firstName} ${lastName}`,
                profilePictureUrl: `https://i.pravatar.cc/300?u=${encodeURIComponent(normalizedEmail)}`,
                bio: `I'm a developer with experience in ${randomLanguage} and ${randomFramework}. Looking to collaborate on interesting projects and learn new technologies.`,
                location,
                timezone: rand(timezones),
                website: randBool(0.6) ? `https://${username}.dev` : null,
                githubUrl: `https://github.com/${username}`,
                linkedinUrl: `https://linkedin.com/in/${username}`,
                role: UserRole.USER,
                accountType: AccountType.INDIVIDUAL,
                isActive: true,
                isBanned: false,
                bannedUntil: null,
                banReason: null,
                profileVisibility: rand(['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY']),
                showEmail: randBool(0.3),
                showLocation: randBool(0.8),
                allowMessages: randBool(0.9),
                profileCompleted: true,
                emailVerified: new Date(),
                reputationScore: Math.floor(Math.random() * 500),
                totalContributions: Math.floor(Math.random() * 200),
            },
        });

        createdUser = user;

        // Skills, experiences, education, projects
        await tx.skill.createMany({ data: generateSkills(user.id), skipDuplicates: true });
        await tx.experience.createMany({ data: generateExperiences(user.id), skipDuplicates: true });
        await tx.education.createMany({ data: generateEducation(user.id), skipDuplicates: true });
        await tx.project.createMany({ data: generateProjects(user.id) });

        // Profile progress
        await tx.profileProgress.upsert({
            where: { userId: user.id },
            update: { lastUpdated: new Date() },
            create: { userId: user.id, currentSection: rand(['basic', 'education', 'experience', 'project', 'skills']), lastUpdated: new Date() },
        });
    }, { timeout: 20000 });

    if (!createdUser) return;

    // Post-transaction enrichments
    // Achievements
    let achievements = await prisma.achievement.findMany({ take: 3 });
    if (achievements.length === 0) {
        achievements = await Promise.all([
            prisma.achievement.create({ data: { name: 'First Project', description: 'Created your first project!', icon: '🚀', category: 'Milestone', points: 10, criteria: { type: 'project_created' } } }),
            prisma.achievement.create({ data: { name: 'Profile Complete', description: 'Completed your profile.', icon: '✅', category: 'Profile', points: 5, criteria: { type: 'profile_completed' } } }),
            prisma.achievement.create({ data: { name: 'First Connection', description: 'Made your first connection.', icon: '🤝', category: 'Networking', points: 5, criteria: { type: 'connection_made' } } }),
        ]);
    }
    for (const ach of achievements) {
        await prisma.userAchievement.upsert({
            where: { userId_achievementId: { userId: createdUser.id, achievementId: ach.id } },
            update: {},
            create: { userId: createdUser.id, achievementId: ach.id, unlockedAt: new Date() },
        });
    }

    // Endorse a couple skills
    const userSkills = await prisma.skill.findMany({ where: { userId: createdUser.id } });
    for (const skill of userSkills.slice(0, 2)) {
        await prisma.endorsement.upsert({
            where: { skillId_giverId: { skillId: skill.id, giverId: createdUser.id } },
            update: {},
            create: { skillId: skill.id, giverId: createdUser.id, receiverId: createdUser.id, message: `Endorsed for ${skill.name}!` },
        });
    }

    // Connection privacy
    await prisma.connectionPrivacy.upsert({
        where: { userId: createdUser.id },
        update: {},
        create: {
            userId: createdUser.id,
            connectionPrivacyLevel: 'EVERYONE',
            connectionRequestLevel: 'EVERYONE',
            hideConnections: false,
            autoDeclineRequests: false,
            blockedUserIds: [],
        },
    });

    // Notification preferences
    await prisma.notificationPreference.upsert({
        where: { userId_category: { userId: createdUser.id, category: 'SYSTEM' } },
        update: {},
        create: {
            userId: createdUser.id,
            category: 'SYSTEM',
            inAppEnabled: true,
            emailEnabled: randBool(0.5),
            pushEnabled: randBool(0.5),
            smsEnabled: false,
            digestFrequency: 'DAILY',
            timezone: createdUser.timezone || 'UTC',
        },
    });

    // Suggestion cache
    // await prisma.userSimilarCache.upsert({
    //     where: { userId: createdUser.id },
    //     update: { data: { users: [], total: 0 }, updatedAt: new Date() },
    //     create: { userId: createdUser.id, data: { users: [], total: 0 } },
    // });

    // Recent activity
    const actions = ['LOGIN', 'PROFILE_UPDATE', 'PROJECT_CREATE', 'CONNECTION_ACCEPT', 'SKILL_ADD'];
    for (let j = 0; j < 2 + Math.floor(Math.random() * 3); j++) {
        await prisma.userActivity.create({
            data: {
                userId: createdUser.id,
                action: rand(actions),
                resource: null,
                metadata: {},
                ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                userAgent: 'Mozilla/5.0',
            },
        });
    }

    // Embeddings pipeline: extract, embed, store
    try {
        const profile = await extractUserProfileData(createdUser.id);
        if (!profile) throw new Error('Profile extraction failed');
        await generateUserEmbedding(createdUser.id);
        await storeUserEmbedding(createdUser.id);
        console.log(`Embedding stored for ${createdUser.email}`);
    } catch (e) {
        console.warn(`Embedding pipeline failed for ${createdUser.email}:`, (e as any)?.message || e);
    }

    console.log(`Seeded profile data for ${createdUser.email}`);
}

async function main() {
    // Usage:
    // node --loader ts-node/esm prisma/seed/SeedUserFromEmail.ts user1@example.com,user2@example.com
    // or: EMAILS=user1@example.com,user2@example.com node --loader ts-node/esm prisma/seed/SeedUserFromEmail.ts
    const argList = process.argv[2] || process.env.EMAILS || '';
    if (!argList) {
        console.error('Please provide one or more comma-separated emails as an argument or set EMAILS env.');
        process.exit(1);
    }
    const emails = argList.split(',').map(e => e.trim()).filter(Boolean);
    for (const email of emails) {
        try {
            await seedOne(email);
        } catch (e) {
            console.error(`Failed seeding for ${email}:`, (e as any)?.message || e);
        }
    }
}

if (import.meta.url === process.argv[1] || import.meta.url === `file://${process.argv[1]}`) {
    main()
        .then(() => console.log('Done seeding provided emails'))
        .catch((e) => console.error('Error during seeding:', e))
        .finally(() => prisma.$disconnect());
}

export { main as seedFromEmails };