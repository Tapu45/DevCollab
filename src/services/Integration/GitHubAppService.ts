import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { readFileSync } from 'fs';
import { prisma } from '@/lib/Prisma';

interface GitHubAppConfig {
    appId: string;
    privateKey: string;
    clientId: string;
    clientSecret: string;
    webhookSecret: string;
}

class GitHubAppService {
    private config: GitHubAppConfig;
    private appOctokit: Octokit;

    constructor() {
        this.config = {
            appId: process.env.GITHUB_APP_ID!,
            privateKey: this.loadPrivateKey(),
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            webhookSecret: process.env.GITHUB_WEBHOOK_SECRET!,
        };

        this.appOctokit = new Octokit({
            authStrategy: createAppAuth,
            auth: {
                appId: this.config.appId,
                privateKey: this.config.privateKey,
            },
        });
    }

    private loadPrivateKey(): string {
        // Prefer env variable (for Vercel/production)
        if (process.env.GITHUB_PRIVATE_KEY) {
            // Replace literal '\n' with real newlines
            return process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n');
        }
        // Fallback to file path (for local dev)
        const keyPath = process.env.GITHUB_PRIVATE_KEY_PATH;
        if (!keyPath) {
            throw new Error('GITHUB_PRIVATE_KEY or GITHUB_PRIVATE_KEY_PATH is required');
        }
        return readFileSync(keyPath, 'utf8');
    }

    // Get installation access token
    async getInstallationToken(installationId: number): Promise<string> {
        const { data } = await this.appOctokit.apps.createInstallationAccessToken({
            installation_id: installationId,
        });
        return data.token;
    }

    // Get Octokit instance for specific installation
    async getInstallationOctokit(installationId: number): Promise<Octokit> {
        const token = await this.getInstallationToken(installationId);
        return new Octokit({ auth: token });
    }

    // Install GitHub App for user
    async installApp(userId: string, installationId: number): Promise<void> {
        const octokit = await this.getInstallationOctokit(installationId);

        // Get installation details
        const { data: installation } = await this.appOctokit.apps.getInstallation({
            installation_id: installationId,
        });

        // Get user details
        const { data: user } = await octokit.users.getAuthenticated();

        // Find or create the Account for the user
        let account = await prisma.account.findFirst({
            where: {
                userId,
                provider: 'github',
                providerAccountId: user.id.toString(),
            },
        });

        if (!account) {
            account = await prisma.account.create({
                data: {
                    userId,
                    provider: 'github',
                    providerAccountId: user.id.toString(),
                    type: 'oauth',
                    // Add other required fields if needed
                },
            });
        }

        // Store installation
        await prisma.gitHubAppInstallation.upsert({
            where: { installationId },
            update: {
                accountId: account.id,
                githubAccountId: user.id.toString(),
                accountLogin: user.login,
                accountType: user.type,
                permissions: installation.permissions,
                events: installation.events,
                accessTokensUrl: installation.access_tokens_url,
                repositoriesUrl: installation.repositories_url,
                htmlUrl: installation.html_url,
                isActive: true,
            },
            create: {
                accountId: account.id,
                installationId,
                githubAccountId: user.id.toString(),
                accountLogin: user.login,
                accountType: user.type,
                permissions: installation.permissions,
                events: installation.events,
                accessTokensUrl: installation.access_tokens_url,
                repositoriesUrl: installation.repositories_url,
                htmlUrl: installation.html_url,
                isActive: true,
            },
        });

        // Sync repositories
        await this.syncRepositories(installationId);
    }

    // Sync repositories for installation
    async syncRepositories(installationId: number): Promise<void> {
        const octokit = await this.getInstallationOctokit(installationId);
        const installation = await prisma.gitHubAppInstallation.findUnique({
            where: { installationId },
        });

        if (!installation) {
            throw new Error('Installation not found');
        }

        // Get all repositories
        const { data: repos } = await octokit.apps.listReposAccessibleToInstallation({
            per_page: 100,
        });

        for (const repo of repos.repositories) {
            // Get repository details
            const { data: repoDetails } = await octokit.repos.get({
                owner: repo.owner.login,
                repo: repo.name,
            });

            // Get languages
            const { data: languages } = await octokit.repos.listLanguages({
                owner: repo.owner.login,
                repo: repo.name,
            });

            // Store/update repository
            await prisma.gitHubRepository.upsert({
                where: { repoId: repo.id },
                update: {
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    private: repo.private,
                    htmlUrl: repo.html_url,
                    cloneUrl: repo.clone_url,
                    sshUrl: repo.ssh_url,
                    defaultBranch: repo.default_branch,
                    language: repo.language,
                    languages: languages,
                    topics: repo.topics || [],
                    stargazersCount: repo.stargazers_count,
                    watchersCount: repo.watchers_count,
                    forksCount: repo.forks_count,
                    openIssuesCount: repo.open_issues_count,
                    size: repo.size,
                    createdAt: repo.created_at ? new Date(repo.created_at) : new Date(),
                    updatedAt: repo.updated_at ? new Date(repo.updated_at) : new Date(),
                    pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
                    lastSynced: new Date(),
                },
                create: {
                    installationId: installation.id,
                    repoId: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    private: repo.private,
                    htmlUrl: repo.html_url,
                    cloneUrl: repo.clone_url,
                    sshUrl: repo.ssh_url,
                    defaultBranch: repo.default_branch,
                    language: repo.language,
                    languages: languages,
                    topics: repo.topics || [],
                    stargazersCount: repo.stargazers_count,
                    watchersCount: repo.watchers_count,
                    forksCount: repo.forks_count,
                    openIssuesCount: repo.open_issues_count,
                    size: repo.size,
                    createdAt: repo.created_at ? new Date(repo.created_at) : new Date(),
                    updatedAt: repo.updated_at ? new Date(repo.updated_at) : new Date(),
                    pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
                    lastSynced: new Date(),
                },
            });
        }
    }

    // Sync commits for repository
    async syncCommits(repositoryId: string, since?: Date): Promise<void> {
        const repo = await prisma.gitHubRepository.findUnique({
            where: { id: repositoryId },
            include: { installation: true },
        });

        if (!repo) {
            throw new Error('Repository not found');
        }

        const octokit = await this.getInstallationOctokit(repo.installation.installationId);

        const [owner, repoName] = repo.fullName.split('/');

        const { data: commits } = await octokit.repos.listCommits({
            owner,
            repo: repoName,
            since: since?.toISOString(),
            per_page: 100,
        });

        for (const commit of commits) {
            await prisma.gitHubCommit.upsert({
                where: { sha: commit.sha },
                update: {
                    message: commit.commit.message,
                    authorName: commit.commit.author?.name || '',
                    authorEmail: commit.commit.author?.email || '',
                    authorDate: new Date(commit.commit.author?.date || ''),
                    committerName: commit.commit.committer?.name || '',
                    committerEmail: commit.commit.committer?.email || '',
                    committerDate: new Date(commit.commit.committer?.date || ''),
                    htmlUrl: commit.html_url,
                    stats: commit.stats,
                    files: commit.files,
                },
                create: {
                    repositoryId: repo.id,
                    sha: commit.sha,
                    message: commit.commit.message,
                    authorName: commit.commit.author?.name || '',
                    authorEmail: commit.commit.author?.email || '',
                    authorDate: new Date(commit.commit.author?.date || ''),
                    committerName: commit.commit.committer?.name || '',
                    committerEmail: commit.commit.committer?.email || '',
                    committerDate: new Date(commit.commit.committer?.date || ''),
                    htmlUrl: commit.html_url,
                    stats: commit.stats,
                    files: commit.files,
                },
            });
        }
    }

    // Sync issues for repository
    async syncIssues(repositoryId: string): Promise<void> {
        const repo = await prisma.gitHubRepository.findUnique({
            where: { id: repositoryId },
            include: { installation: true },
        });

        if (!repo) {
            throw new Error('Repository not found');
        }

        const octokit = await this.getInstallationOctokit(repo.installation.installationId);
        const [owner, repoName] = repo.fullName.split('/');

        const { data: issues } = await octokit.issues.listForRepo({
            owner,
            repo: repoName,
            state: 'all',
            per_page: 100,
        });

        for (const issue of issues) {
            if (issue.pull_request) continue; // Skip PRs

            await prisma.gitHubIssue.upsert({
                where: {
                    repositoryId_issueNumber: {
                        repositoryId: repo.id,
                        issueNumber: issue.number,
                    },
                },
                update: {
                    title: issue.title,
                    body: issue.body,
                    state: issue.state,
                    author: issue.user?.login || '',
                    assignees: issue.assignees?.map(a => a.login) || [],
                    labels: issue.labels?.map(l => typeof l === 'string' ? l : l.name).filter((l): l is string => typeof l === 'string' && l !== undefined) || [],
                    milestone: issue.milestone?.title,
                    htmlUrl: issue.html_url,
                    createdAt: new Date(issue.created_at),
                    updatedAt: new Date(issue.updated_at),
                    closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
                    lastSynced: new Date(),
                },
                create: {
                    repositoryId: repo.id,
                    issueNumber: issue.number,
                    title: issue.title,
                    body: issue.body,
                    state: issue.state,
                    author: issue.user?.login || '',
                    assignees: issue.assignees?.map(a => a.login) || [],
                    labels: (issue.labels?.map(l => typeof l === 'string' ? l : l.name).filter((l): l is string => !!l)) || [],
                    milestone: issue.milestone?.title,
                    htmlUrl: issue.html_url,
                    createdAt: new Date(issue.created_at),
                    updatedAt: new Date(issue.updated_at),
                    closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
                    lastSynced: new Date(),
                },
            });
        }
    }

    // Sync pull requests for repository
    async syncPullRequests(repositoryId: string): Promise<void> {
        const repo = await prisma.gitHubRepository.findUnique({
            where: { id: repositoryId },
            include: { installation: true },
        });

        if (!repo) {
            throw new Error('Repository not found');
        }

        const octokit = await this.getInstallationOctokit(repo.installation.installationId);
        const [owner, repoName] = repo.fullName.split('/');

        const { data: pullRequests } = await octokit.pulls.list({
            owner,
            repo: repoName,
            state: 'all',
            per_page: 100,
        });

        for (const pr of pullRequests) {
            await prisma.gitHubPullRequest.upsert({
                where: {
                    repositoryId_prNumber: {
                        repositoryId: repo.id,
                        prNumber: pr.number,
                    },
                },
                update: {
                    title: pr.title,
                    body: pr.body,
                    state: pr.state,
                    author: pr.user?.login || '',
                    assignees: pr.assignees?.map(a => a.login) || [],
                    reviewers: pr.requested_reviewers?.map(r => r.login) || [],
                    labels: pr.labels?.map(l => typeof l === 'string' ? l : l.name) || [],
                    milestone: pr.milestone?.title,
                    baseBranch: pr.base.ref,
                    headBranch: pr.head.ref,
                    htmlUrl: pr.html_url,
                    createdAt: new Date(pr.created_at),
                    updatedAt: new Date(pr.updated_at),
                    closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
                    mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
                    lastSynced: new Date(),
                },
                create: {
                    repositoryId: repo.id,
                    prNumber: pr.number,
                    title: pr.title,
                    body: pr.body,
                    state: pr.state,
                    author: pr.user?.login || '',
                    assignees: pr.assignees?.map(a => a.login) || [],
                    reviewers: pr.requested_reviewers?.map(r => r.login) || [],
                    labels: pr.labels?.map(l => typeof l === 'string' ? l : l.name) || [],
                    milestone: pr.milestone?.title,
                    baseBranch: pr.base.ref,
                    headBranch: pr.head.ref,
                    htmlUrl: pr.html_url,
                    createdAt: new Date(pr.created_at),
                    updatedAt: new Date(pr.updated_at),
                    closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
                    mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
                    lastSynced: new Date(),
                },
            });
        }
    }

    // Get comprehensive stats for user
    async getUserStats(userId: string): Promise<any> {
        const installations = await prisma.gitHubAppInstallation.findMany({
            where: { isActive: true },
            include: {
                account: true, // <-- Add this line
                repositories: {
                    include: {
                        commits: true,
                        issues: true,
                        pullRequests: true,
                    },
                },
            },
        });

        // Filter installations by userId via account
        const userInstallations = installations.filter(installation =>
            installation.account.userId === userId
        );

        const stats = {
            installations: userInstallations.length,
            repositories: userInstallations.reduce((sum, inst) => sum + inst.repositories.length, 0),
            totalCommits: userInstallations.reduce((sum, inst) =>
                sum + inst.repositories.reduce((repoSum, repo) => repoSum + repo.commits.length, 0), 0),
            totalIssues: userInstallations.reduce((sum, inst) =>
                sum + inst.repositories.reduce((repoSum, repo) => repoSum + repo.issues.length, 0), 0),
            totalPullRequests: userInstallations.reduce((sum, inst) =>
                sum + inst.repositories.reduce((repoSum, repo) => repoSum + repo.pullRequests.length, 0), 0),
            totalStars: userInstallations.reduce((sum, inst) =>
                sum + inst.repositories.reduce((repoSum, repo) => repoSum + repo.stargazersCount, 0), 0),
            totalForks: userInstallations.reduce((sum, inst) =>
                sum + inst.repositories.reduce((repoSum, repo) => repoSum + repo.forksCount, 0), 0),
            languages: this.aggregateLanguages(userInstallations),
            recentActivity: await this.getRecentActivity(userId),
        };

        return stats;
    }

    private aggregateLanguages(installations: any[]): Record<string, number> {
        const languages: Record<string, number> = {};

        installations.forEach(installation => {
            installation.repositories.forEach((repo: any) => {
                if (repo.languages) {
                    Object.entries(repo.languages).forEach(([lang, bytes]) => {
                        languages[lang] = (languages[lang] || 0) + (bytes as number);
                    });
                }
            });
        });

        return languages;
    }

    private async getRecentActivity(userId: string): Promise<any[]> {
        return await prisma.gitHubActivity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
    }

    verifyWebhookSignature(payload: string, signature: string | null): boolean {
        if (!signature || !this.config.webhookSecret) return false;

        const sig = Buffer.from(signature.replace('sha256=', ''), 'hex');
        const hmac = require('crypto').createHmac('sha256', this.config.webhookSecret);
        const digest = Buffer.from(hmac.update(payload).digest('hex'), 'hex');

        try {
            return require('crypto').timingSafeEqual(sig, digest);
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }

    // Uninstall GitHub App
    async uninstallApp(installationId: number): Promise<void> {
        await prisma.gitHubAppInstallation.update({
            where: { installationId },
            data: { isActive: false },
        });
    }
}

export const githubAppService = new GitHubAppService();