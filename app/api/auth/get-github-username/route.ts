import { NextRequest, NextResponse } from "next/server";
import { getSessionGitHubUsername } from "@/lib/utils/github-username";

export async function GET(request: NextRequest) {
  try {
    const username = await getSessionGitHubUsername(request);
    
    if (!username) {
      return NextResponse.json(
        { error: "GitHub username not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ username }, { status: 200 });
  } catch (error) {
    console.error("Failed to get GitHub username:", error);
    return NextResponse.json(
      { error: "Failed to get GitHub username" },
      { status: 500 }
    );
  }
}

