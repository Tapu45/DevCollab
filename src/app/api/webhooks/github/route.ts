import { NextRequest, NextResponse } from 'next/server';
import { githubAppService } from '@/services/Integration/GitHubAppService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    if (!githubAppService.verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = request.headers.get('x-github-event');
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

      case 'installation_repositories':
        if (payload.action === 'added') {
          // Handle repositories added to installation
          console.log('Repositories added to installation:', payload.installation.id);
        }
        break;

      case 'push':
        // Handle push events
        console.log('Push event received for repository:', payload.repository.full_name);
        break;

      case 'issues':
        // Handle issue events
        console.log('Issue event received:', payload.action);
        break;

      case 'pull_request':
        // Handle pull request events
        console.log('Pull request event received:', payload.action);
        break;

      default:
        console.log(`Unhandled GitHub event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}