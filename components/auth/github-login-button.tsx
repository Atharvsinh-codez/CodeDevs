"use client";

import { FaGithub } from "react-icons/fa";
import { signIn, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function GitHubLoginButton() {
  const { data: session } = useSession();

  if (session?.user) {
    return null;
  }

  const handleLogin = async () => {
    await signIn.social({
      provider: "github",
    });
  };

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      size="sm"
      className="gap-2 rounded-full"
    >
      <FaGithub className="h-4 w-4" />
      <span className="hidden sm:inline">Sign in with GitHub</span>
      <span className="sm:hidden">Sign in</span>
    </Button>
  );
}

