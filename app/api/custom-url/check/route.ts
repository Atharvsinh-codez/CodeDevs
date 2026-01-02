import { NextRequest, NextResponse } from 'next/server';
import { isCustomSlugAvailable, validateCustomSlug } from '@/lib/utils/custom-url';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { available: false, error: 'Custom URL is required' },
        { status: 400 }
      );
    }

    const validation = validateCustomSlug(slug);
    if (!validation.valid) {
      return NextResponse.json(
        { available: false, error: validation.error },
        { status: 400 }
      );
    }

    const available = await isCustomSlugAvailable(slug);
    return NextResponse.json({ available, error: available ? undefined : 'This custom URL is already taken. Please choose another one.' });
  } catch (error) {
    console.error('Error checking custom URL:', error);
    return NextResponse.json(
      { available: false, error: 'Failed to check custom URL availability' },
      { status: 500 }
    );
  }
}

