import { NextResponse } from 'next/server';
import { getCurrentTrack } from '@/lib/spotify';
import ImageGenerator from '@/lib/generate-image';

// Create a new image every 30 seconds.
export const runtime = 'nodejs';
export const revalidate = 30;

export async function GET() {
    const response = await getCurrentTrack();

    // If the response is unknown, return a 500 error.
    if (response.type === 'unknown') return NextResponse.error();

    // If the response has a track, generate an image.
    if (response.track) {
        return new Response(await ImageGenerator.createSpotifyImage(response.track), {
            headers: {
                'Content-Type': 'image/png',
            },
        });
    }

    // Otherwise, return the response.
    return NextResponse.json(response);
}
