import { prisma } from '@/lib/Prisma';

interface GitHubStats {
    public_repos: number;
    followers: number;
    following: number;
    total_stars: number;
    total_commits: number;
    languages: Record<string, number>;
}

interface GitLabStats {
    public_projects: number;
    followers: number;
    following: number;
    total_commits: number;
    languages: Record<string, number>;
}

interface LinkedInStats {
    connections: number;
    profile_views: number;
    posts_count: number;
}

interface LeetCodeStats {
    total_solved: number;
    easy_solved: number;
    medium_solved: number;
    hard_solved: number;
    acceptance_rate: number;
    ranking: number;
}

export async function collectGitHubStats(userId: string, forceRefresh = false) {
    const account = await prisma.account.findFirst({
        where: { userId, provider: 'github' }
    });

    if (!account?.access_token) {
        throw new Error('GitHub account not connected or no access token');
    }

    // Check if we need to refresh (24 hours)
    const lastStats = await prisma.accountStats.findFirst({
        where: { accountId: account.id, provider: 'github' },
        orderBy: { lastUpdated: 'desc' }
    });

    if (!forceRefresh && lastStats &&
        Date.now() - lastStats.lastUpdated.getTime() < 24 * 60 * 60 * 1000) {
        return { message: 'Stats are up to date' };
    }

    try {
        // Fetch GitHub stats
        const [userResponse, reposResponse] = await Promise.all([
            fetch('https://api.github.com/user', {
                headers: { Authorization: `token ${account.access_token}` }
            }),
            fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
                headers: { Authorization: `token ${account.access_token}` }
            })
        ]);

        if (!userResponse.ok || !reposResponse.ok) {
            throw new Error('Failed to fetch GitHub data');
        }

        const user = await userResponse.json();
        const repos = await reposResponse.json();

        // Calculate stats
        const totalStars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
        const languages: Record<string, number> = {};

        // Get language stats from repos
        for (const repo of repos.slice(0, 10)) { // Limit to avoid rate limits
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        }

        const stats = [
            { statsType: 'repositories', value: user.public_repos },
            { statsType: 'followers', value: user.followers },
            { statsType: 'following', value: user.following },
            { statsType: 'stars', value: totalStars },
            { statsType: 'languages', value: Object.keys(languages).length, metadata: languages }
        ];

        // Upsert stats
        for (const stat of stats) {
            await prisma.accountStats.upsert({
                where: {
                    accountId_provider_statsType: {
                        accountId: account.id,
                        provider: 'github',
                        statsType: stat.statsType
                    }
                },
                update: {
                    value: stat.value,
                    metadata: stat.metadata,
                    lastUpdated: new Date()
                },
                create: {
                    accountId: account.id,
                    provider: 'github',
                    statsType: stat.statsType,
                    value: stat.value,
                    metadata: stat.metadata,
                    userId: userId
                }
            });
        }

        return { message: 'GitHub stats updated successfully', stats };
    } catch (error) {
        console.error('GitHub stats collection error:', error);
        throw error;
    }
}

export async function collectGitLabStats(userId: string, forceRefresh = false) {
    const account = await prisma.account.findFirst({
        where: { userId, provider: 'gitlab' }
    });

    if (!account?.access_token) {
        throw new Error('GitLab account not connected or no access token');
    }

    // Check if we need to refresh (24 hours)
    const lastStats = await prisma.accountStats.findFirst({
        where: { accountId: account.id, provider: 'gitlab' },
        orderBy: { lastUpdated: 'desc' }
    });

    if (!forceRefresh && lastStats &&
        Date.now() - lastStats.lastUpdated.getTime() < 24 * 60 * 60 * 1000) {
        return { message: 'Stats are up to date' };
    }

    try {
        // Fetch GitLab stats
        const [userResponse, projectsResponse] = await Promise.all([
            fetch('https://gitlab.com/api/v4/user', {
                headers: { Authorization: `Bearer ${account.access_token}` }
            }),
            fetch('https://gitlab.com/api/v4/projects?membership=true&per_page=100', {
                headers: { Authorization: `Bearer ${account.access_token}` }
            })
        ]);

        if (!userResponse.ok || !projectsResponse.ok) {
            throw new Error('Failed to fetch GitLab data');
        }

        const user = await userResponse.json();
        const projects = await projectsResponse.json();

        const stats = [
            { statsType: 'projects', value: projects.length },
            { statsType: 'followers', value: user.followers || 0 },
            { statsType: 'following', value: user.following || 0 }
        ];

        // Upsert stats
        for (const stat of stats) {
            await prisma.accountStats.upsert({
                where: {
                    accountId_provider_statsType: {
                        accountId: account.id,
                        provider: 'gitlab',
                        statsType: stat.statsType
                    }
                },
                update: {
                    value: stat.value,
                    lastUpdated: new Date()
                },
                create: {
                    accountId: account.id,
                    provider: 'gitlab',
                    statsType: stat.statsType,
                    value: stat.value,
                    userId: userId
                }
            });
        }

        return { message: 'GitLab stats updated successfully', stats };
    } catch (error) {
        console.error('GitLab stats collection error:', error);
        throw error;
    }
}

export async function collectLinkedInStats(userId: string, forceRefresh = false) {
    const account = await prisma.account.findFirst({
        where: { userId, provider: 'linkedin' }
    });

    if (!account?.access_token) {
        throw new Error('LinkedIn account not connected or no access token');
    }

    // Check if we need to refresh (24 hours)
    const lastStats = await prisma.accountStats.findFirst({
        where: { accountId: account.id, provider: 'linkedin' },
        orderBy: { lastUpdated: 'desc' }
    });

    if (!forceRefresh && lastStats &&
        Date.now() - lastStats.lastUpdated.getTime() < 24 * 60 * 60 * 1000) {
        return { message: 'Stats are up to date' };
    }

    try {
        // LinkedIn API requires different scopes and endpoints
        // For now, we'll store basic connection info
        const stats = [
            { statsType: 'connections', value: 0 }, // Will be updated when we have proper LinkedIn API access
            { statsType: 'profile_views', value: 0 }
        ];

        // Upsert stats
        for (const stat of stats) {
            await prisma.accountStats.upsert({
                where: {
                    accountId_provider_statsType: {
                        accountId: account.id,
                        provider: 'linkedin',
                        statsType: stat.statsType
                    }
                },
                update: {
                    value: stat.value,
                    lastUpdated: new Date()
                },
                create: {
                    accountId: account.id,
                    provider: 'linkedin',
                    statsType: stat.statsType,
                    value: stat.value,
                    userId: userId
                }
            });
        }

        return { message: 'LinkedIn stats updated successfully', stats };
    } catch (error) {
        console.error('LinkedIn stats collection error:', error);
        throw error;
    }
}

export async function collectLeetCodeStats(userId: string, forceRefresh = false) {
    const profile = await prisma.externalProfile.findFirst({
        where: { userId, provider: 'leetcode' }
    });

    if (!profile) {
        throw new Error('LeetCode profile not connected');
    }

    // Check if we need to refresh (24 hours)
    const lastStats = await prisma.externalProfileStats.findFirst({
        where: { profileId: profile.id, provider: 'leetcode' },
        orderBy: { lastUpdated: 'desc' }
    });

    if (!forceRefresh && lastStats &&
        Date.now() - lastStats.lastUpdated.getTime() < 24 * 60 * 60 * 1000) {
        return { message: 'Stats are up to date' };
    }

    try {
        // LeetCode GraphQL API
        const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          profile {
            ranking
            userAvatar
            realName
            aboutMe
            school
            websites
            countryName
            company
            jobTitle
            skillTags
            postViewCount
            postViewCountDiff
            reputation
            reputationDiff
            solutionCount
            solutionCountDiff
            categoryDiscussCount
            categoryDiscussCountDiff
          }
        }
      }
    `;

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { username: profile.username }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch LeetCode data');
        }

        const data = await response.json();
        const user = data.data?.matchedUser;

        if (!user) {
            throw new Error('LeetCode user not found');
        }

        const solvedStats = user.submitStats.acSubmissionNum;
        const totalSolved = solvedStats.reduce((sum: number, stat: any) => sum + stat.count, 0);
        const easySolved = solvedStats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
        const mediumSolved = solvedStats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
        const hardSolved = solvedStats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

        const stats = [
            { statsType: 'total_solved', value: totalSolved },
            { statsType: 'easy_solved', value: easySolved },
            { statsType: 'medium_solved', value: mediumSolved },
            { statsType: 'hard_solved', value: hardSolved },
            { statsType: 'ranking', value: user.profile.ranking || 0 },
            { statsType: 'acceptance_rate', value: 0 } // Calculate from submissions
        ];

        // Upsert stats
        for (const stat of stats) {
            await prisma.externalProfileStats.upsert({
                where: {
                    profileId_provider_statsType: {
                        profileId: profile.id,
                        provider: 'leetcode',
                        statsType: stat.statsType
                    }
                },
                update: {
                    value: stat.value,
                    lastUpdated: new Date()
                },
                create: {
                    profileId: profile.id,
                    provider: 'leetcode',
                    statsType: stat.statsType,
                    value: stat.value
                }
            });
        }

        return { message: 'LeetCode stats updated successfully', stats };
    } catch (error) {
        console.error('LeetCode stats collection error:', error);
        throw error;
    }
}