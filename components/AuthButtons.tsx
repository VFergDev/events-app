"use client"; // Mark as a Client Component
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";

export default function AuthButtons() {
  const { isSignedIn } = useUser();

  return (
    <div>
      {!isSignedIn && (
        <SignInButton>
          <Button>Sign In</Button>
        </SignInButton>
      )}
      {isSignedIn && (
        <SignOutButton>
          <Button variant="destructive">Sign Out</Button>
        </SignOutButton>
      )}
    </div>
  );
}
