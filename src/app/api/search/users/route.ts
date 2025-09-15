import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const q = (searchParams.get('q') || '').trim();
        const skills = (searchParams.get('skills') || '').split(',').map(s => s.trim()).filter(Boolean);
        const location = (searchParams.get('location') || '').trim() || undefined;
        const hasProjects = (searchParams.get('hasProjects') || '').trim().toLowerCase() === 'true' ? true
            : (searchParams.get('hasProjects') || '').trim().toLowerCase() === 'false' ? false
                : undefined;
        const experienceYearsMin = parseInt(searchParams.get('experienceYearsMin') || '', 10);
        const educationDegree = (searchParams.get('educationDegree') || '').trim() || undefined;
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            profileVisibility: { not: 'PRIVATE' },
            isActive: true,
            AND: [] as any[],
        };

        if (q) {
            where.AND.push({
                OR: [
                    { displayName: { contains: q, mode: 'insensitive' } },
                    { username: { contains: q, mode: 'insensitive' } },
                    { bio: { contains: q, mode: 'insensitive' } },
                    { skills: { some: { name: { contains: q, mode: 'insensitive' } } } },
                    {
                        experiences: {
                            some: {
                                OR: [
                                    { title: { contains: q, mode: 'insensitive' } },
                                    { company: { contains: q, mode: 'insensitive' } },
                                ]
                            }
                        }
                    },
                    {
                        educations: {
                            some: {
                                OR: [
                                    { institution: { contains: q, mode: 'insensitive' } },
                                    { degree: { contains: q, mode: 'insensitive' } },
                                    { fieldOfStudy: { contains: q, mode: 'insensitive' } },
                                ]
                            }
                        }
                    },
                    {
                        ownedProjects: {
                            some: {
                                OR: [
                                    { title: { contains: q, mode: 'insensitive' } },
                                    { description: { contains: q, mode: 'insensitive' } },
                                    { tags: { has: q } },
                                    { techStack: { has: q } },
                                ]
                            }
                        }
                    },
                ],
            });
        }

        if (skills.length) {
            where.AND.push({
                skills: {
                    some: { name: { in: skills }, },
                },
            });
        }

        if (location) {
            where.AND.push({ location: { contains: location, mode: 'insensitive' } });
        }

        if (typeof hasProjects === 'boolean') {
            where.AND.push({
                ownedProjects: { some: {} },
            });
            if (hasProjects === false) {
                // If explicitly false, invert with NOT some
                where.AND.pop();
                where.AND.push({
                    ownedProjects: { none: {} },
                });
            }
        }

        if (!Number.isNaN(experienceYearsMin)) {
            // Approximate using years across experiences (filter by startDate range presence)
            // You can refine to compute sum on the fly if you materialize stats.
            where.AND.push({
                experiences: { some: { startDate: { lte: new Date() } } },
            });
        }

        if (educationDegree) {
            where.AND.push({
                educations: { some: { degree: { contains: educationDegree, mode: 'insensitive' } } },
            });
        }

        const [total, users] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ reputationScore: 'desc' }, { createdAt: 'desc' }],
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    bio: true,
                    profilePictureUrl: true,
                    location: true,
                    skills: { select: { name: true, category: true, proficiencyLevel: true } },
                    experiences: {
                        select: { title: true, company: true, startDate: true, endDate: true, isCurrent: true },
                        take: 3,
                        orderBy: { startDate: 'desc' },
                    },
                    educations: {
                        select: { institution: true, degree: true, fieldOfStudy: true, startDate: true, endDate: true },
                        take: 2,
                        orderBy: { startDate: 'desc' },
                    },
                    ownedProjects: {
                        select: { id: true, title: true, tags: true, techStack: true, visibility: true },
                        take: 3,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            }),
        ]);

        return NextResponse.json({ total, page, limit, users });
    } catch (err) {
        console.error('User search error:', err);
        return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
    }
}