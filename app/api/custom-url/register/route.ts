import { NextRequest, NextResponse } from 'next/server';
import { createCustomUrl } from '@/lib/utils/custom-url';
import { verifyUsername } from '@/lib/utils/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customSlug, githubUsername } = body;

    if (!customSlug || typeof customSlug !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Custom URL is required' },
        { status: 400 }
      );
    }

    if (!githubUsername || typeof githubUsername !== 'string') {
      return NextResponse.json(
        { success: false, error: 'GitHub username is required' },
        { status: 400 }
      );
    }

    const validatedGithubUsername = verifyUsername(githubUsername);
    const result = await createCustomUrl(customSlug, validatedGithubUsername);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error?.includes('already taken') ? 409 : 400 }
      );
    }

    return NextResponse.json({ success: true, customSlug: customSlug.toLowerCase().trim() });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Invalid')) {
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }
    console.error('Error registering custom URL:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register custom URL' },
      { status: 500 }
    );
  }
}

