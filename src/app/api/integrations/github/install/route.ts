import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { githubAppService } from '@/services/Integration/GitHubAppService';

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { installation_id } = await req.json();

    if (!installation_id) {
        return NextResponse.json({ error: 'Installation ID is required' }, { status: 400 });
    }

    try {
        await githubAppService.installApp(userId, installation_id);
        return NextResponse.json({ success: true, message: 'GitHub App installed successfully' });
    } catch (error) {
        console.error('GitHub App installation error:', error);
        return NextResponse.json({ error: 'Failed to install GitHub App' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const installationId = searchParams.get('installation_id');

    if (!installationId) {
        return NextResponse.json({ error: 'Installation ID is required' }, { status: 400 });
    }

    try {
        await githubAppService.uninstallApp(parseInt(installationId));
        return NextResponse.json({ success: true, message: 'GitHub App uninstalled successfully' });
    } catch (error) {
        console.error('GitHub App uninstallation error:', error);
        return NextResponse.json({ error: 'Failed to uninstall GitHub App' }, { status: 500 });
    }
}