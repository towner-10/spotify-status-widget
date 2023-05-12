import { NextResponse } from 'next/server';
import { getCurrentTrack } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json(await getCurrentTrack());
}
