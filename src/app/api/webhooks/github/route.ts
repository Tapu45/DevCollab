import { NextRequest, NextResponse } from 'next/server';
import { githubAppService } from '@/services/GitHubAppService';
import { prisma } from '@/lib/Prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-hub-signature-256');

    // Verify webhook signature
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 401 });
    }

    // TODO: Implement signature verification
    // const crypto = require('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET!)
    //   .update(body)
    //   .digest('hex');
    // const providedSignature = signature.replace('sha256=', '');
    // if (expectedSignature !== providedSignature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const event = req.headers.get('x-github-event');
    const payload = JSON.parse(body);

    switch (event) {
      case 'installation':
        if (payload.action === 'created') {
          // Handle new installation
          console.log('New GitHub App installation:', payload.installation.id);
        } else if (payload.action === 'deleted') {
          // Handle installation deletion
          await githubAppService.uninstallApp(payload.installation.id);
        }
        break;

      case 'push':
        await handlePushEvent(payload);
        break;

      case 'pull_request':
        await handlePullRequestEvent(payload);
        break;

      case 'issues':
        await handleIssuesEvent(payload);
        break;

      default:
        console.log(`Unhandled GitHub event: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePushEvent(payload: any) {
  const installation = await prisma.githubAppInstallation.findFirst({
    where: { installationId: payload.installation.id },
    include: { user: true },
  });

  if (!installation) return;

  const repo = await prisma.githubRepository.findFirst({
    where: {
      fullName: payload.repository.full_name,
      installationId: installation.id,
    },
  });

  if (!repo) return;

  // Sync commits
  await githubAppService.syncCommits(repo.id);

  // Record activity
  await prisma.githubActivity.create({
    data: {
      userId: installation.userId,
      type: 'push',
      repository: payload.repository.full_name,
      title: `Pushed to ${payload.ref}`,
      description: `${payload.commits.length} commits pushed`,
      url: payload.compare,
      metadata: {
        ref: payload.ref,
        commits: payload.commits.length,
        pusher: payload.pusher.name,
      },
    },
  });
}

async function handlePullRequestEvent(payload: any) {
  const installation = await prisma.githubAppInstallation.findFirst({
    where: { installationId: payload.installation.id },
    include: { user: true },
  });

  if (!installation) return;

  const repo = await prisma.githubRepository.findFirst({
    where: {
      fullName: payload.repository.full_name,
      installationId: installation.id,
    },
  });

  if (!repo) return;

  // Sync pull requests
  await githubAppService.syncPullRequests(repo.id);

  // Record activity
  await prisma.githubActivity.create({
    data: {
      userId: installation.userId,
      type: 'pull_request',
      action: payload.action,
      repository: payload.repository.full_name,
      title: payload.pull_request.title,
      description: `PR #${payload.pull_request.number} ${payload.action}`,
      url: payload.pull_request.html_url,
      metadata: {
        number: payload.pull_request.number,
        state: payload.pull_request.state,
        author: payload.pull_request.user.login,
      },
    },
  });
}

async function handleIssuesEvent(payload: any) {
  const installation = await prisma.githubAppInstallation.findFirst({
    where: { installationId: payload.installation.id },
    include: { user: true },
  });

  if (!installation) return;

  const repo = await prisma.githubRepository.findFirst({
    where: {
      fullName: payload.repository.full_name,
      installationId: installation.id,
    },
  });

  if (!repo) return;

  // Sync issues
  await githubAppService.syncIssues(repo.id);

  // Record activity
  await prisma.githubActivity.create({
    data: {
      userId: installation.userId,
      type: 'issue',
      action: payload.action,
      repository: payload.repository.full_name,
      title: payload.issue.title,
      description: `Issue #${payload.issue.number} ${payload.action}`,
      url: payload.issue.html_url,
      metadata: {
        number: payload.issue.number,
        state: payload.issue.state,
        author: payload.issue.user.login,
      },
    },
  });
}