import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/Prisma';
import { githubAppService } from '@/services/Integration/GitHubAppService';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.text();
        const signature = req.headers.get('x-hub-signature-256');
        const eventType = req.headers.get('x-github-event');
        const deliveryId = req.headers.get('x-github-delivery');

        // Verify webhook signature
        if (!githubAppService.verifyWebhookSignature(payload, signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Log webhook receipt
        console.log(`Received GitHub webhook: ${eventType}, ID: ${deliveryId}`);

        // Parse JSON payload
        const data = JSON.parse(payload);

        // Store webhook event in database (use the Delivery model)
        await prisma.gitHubWebhookDelivery.create({
            data: {
                eventType: eventType || 'unknown',
                deliveryId: deliveryId || 'unknown',
                payload: data,
            }
        });

        // Process the webhook based on event type
        await processWebhookEvent(eventType || 'unknown', data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing GitHub webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Process different webhook event types
async function processWebhookEvent(eventType: string, payload: any) {
    const installationId = payload.installation?.id;

    if (!installationId) {
        console.warn('No installation ID found in webhook payload');
        return;
    }

    switch (eventType) {
        case 'installation':
            // Handle app installation/uninstallation
            if (payload.action === 'deleted') {
                await githubAppService.uninstallApp(installationId);
            }
            break;

        case 'push':
            // Handle push events (new commits)
            {
                const repositoryId = payload.repository?.id?.toString();
                if (repositoryId) {
                    const repo = await prisma.gitHubRepository.findFirst({
                        where: { repoId: parseInt(repositoryId) }
                    });

                    if (repo) {
                        await githubAppService.syncCommits(repo.id);
                    }
                }
            }
            break;

        case 'issues':
            // Handle issue events
            {
                const repoId = payload.repository?.id?.toString();
                if (repoId) {
                    const repo = await prisma.gitHubRepository.findFirst({
                        where: { repoId: parseInt(repoId) }
                    });

                    if (repo) {
                        await githubAppService.syncIssues(repo.id);
                    }
                }
            }
            break;

        case 'pull_request':
            // Handle PR events
            {
                const pullRepoId = payload.repository?.id?.toString();
                if (pullRepoId) {
                    const repo = await prisma.gitHubRepository.findFirst({
                        where: { repoId: parseInt(pullRepoId) }
                    });

                    if (repo) {
                        await githubAppService.syncPullRequests(repo.id);
                    }
                }
            }
            break;

        // Add more event types as needed

        default:
            console.log(`Unhandled webhook event type: ${eventType}`);
    }
}   