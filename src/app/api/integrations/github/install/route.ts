import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { githubAppService } from '@/services/Integration/GitHubAppService';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { installation_id } = await req.json();

    if (!installation_id) {
        return NextResponse.json({ error: 'Installation ID is required' }, { status: 400 });
    }

    try {
        await githubAppService.installApp(session.user.id, installation_id);
        return NextResponse.json({ success: true, message: 'GitHub App installed successfully' });
    } catch (error) {
        console.error('GitHub App installation error:', error);
        return NextResponse.json({ error: 'Failed to install GitHub App' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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