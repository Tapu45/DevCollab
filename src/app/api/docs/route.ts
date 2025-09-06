
import { getApiDocs } from '@/lib/Swagger';
import { NextResponse } from 'next/server';

export async function GET() {
    const spec = await getApiDocs();
    return NextResponse.json(spec);
}