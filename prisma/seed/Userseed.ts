import { PrismaClient, UserRole, AccountType, SkillCategory } from '../../src/generated/prisma/index.js';
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
            responsibilities: `Worked on various ${position.toLowerCase()} tasks and projects at ${companyName}.`,
            location: ['Remote', 'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX'][Math.floor(Math.random() * 5)],
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
        description: `Studied computer science fundamentals, algorithms, data structures, and software engineering at ${university}.`,
        grade: ['3.7/4.0', '3.8/4.0', '3.5/4.0', '3.9/4.0'][Math.floor(Math.random() * 4)]
    }];
};

// Helper: Validate user profile completeness
function validateProfile(user: any, skills: any[], experiences: any[], education: any[]) {
    if (!user || !user.id || !user.email || !user.username) return false;
    if (!skills || skills.length < 3) return false;
    if (!experiences || experiences.length < 1) return false;
    if (!education || education.length < 1) return false;
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

            
            // Database transaction
            await prisma.$transaction(async (tx) => {
                // Create user
                const user = await tx.user.create({
                    data: {
                        email,
                        username,
                        passwordHash,
                        firstName: ['Alex', 'Jamie', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Dakota'][Math.floor(Math.random() * 10)],
                        lastName: ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'][Math.floor(Math.random() * 10)],
                        displayName: `Seed Developer ${i}`,
                        profilePictureUrl: `https://i.pravatar.cc/300?img=${i + 10}`,
                        bio: `I'm a developer with experience in ${programmingLanguages[Math.floor(Math.random() * programmingLanguages.length)]} and ${frameworks[Math.floor(Math.random() * frameworks.length)]}. Looking to collaborate on interesting projects!`,
                        location: ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote'][Math.floor(Math.random() * 5)],
                        role: UserRole.USER,
                        accountType: AccountType.INDIVIDUAL,
                        profileCompleted: true,
                        emailVerified: new Date()
                    }
                });

                createdUser = user;

                // Create skills, experiences, education
                const skills = await Promise.all(
                    generateSkills(user.id).map(skill =>
                        tx.skill.create({ data: skill })
                    )
                );
                const experiences = await Promise.all(
                    generateExperiences(user.id).map(exp =>
                        tx.experience.create({ data: exp })
                    )
                );
                const education = await Promise.all(
                    generateEducation(user.id).map(edu =>
                        tx.education.create({ data: edu })
                    )
                );

                // Validate profile completeness
                if (!validateProfile(user, skills, experiences, education)) {
                    throw new Error('Profile incomplete for user: ' + user.email);
                }
            });

            // Store profile in Pinecone (outside transaction)
            if (createdUser) {
                const pineconeSuccess = await storeProfileInPinecone(createdUser);
                if (!pineconeSuccess) {
                    // Cleanup: delete user if embedding fails
                    await prisma.user.delete({ where: { id: createdUser.id } });
                    throw new Error('Embedding failed, user deleted: ' + createdUser.email);
                }
                console.log(`Created seed user ${i}: ${createdUser.email}`);
            }

        } catch (error: any) {
            console.error(`Error creating seed user ${i} (${email}):`, error.message || error);
            failedUsers.push(email);
        }
    }

    // Summary logging
    console.log('Completed seeding users with profiles');
    if (failedUsers.length > 0) {
        console.error(`Failed to seed ${failedUsers.length} users:`, failedUsers);
    } else {
        console.log('All users seeded successfully!');
    }
}

// ...existing code...

export { seedUsers };

// Run this file directly using ts-node if needed
if (import.meta.url === process.argv[1] || import.meta.url === `file://${process.argv[1]}`) {
    seedUsers()
        .then(() => console.log('Seeding completed'))
        .catch(e => console.error('Error during seeding:', e))
        .finally(() => prisma.$disconnect());
}