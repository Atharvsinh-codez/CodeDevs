import { NextRequest, NextResponse } from 'next/server';

// API keys for image generation
const API_KEYS = (process.env.INFIP_API_KEYS || '').split(',').filter(Boolean);

let currentKeyIndex = 0;

function getNextApiKey(): string {
    if (API_KEYS.length === 0) {
        return 'infip-bc358361'; // fallback key
    }
    const key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt, size = '1792x1024' } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const apiKey = getNextApiKey();

        const response = await fetch('https://api.infip.pro/v1/images/generations', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'img4',
                n: 1,
                prompt,
                response_format: 'url',
                size,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Image generation failed:', errorText);
            return NextResponse.json(
                { error: 'Image generation failed' },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            imageUrl: data.data?.[0]?.url || null,
        });
    } catch (error) {
        console.error('Image generation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
