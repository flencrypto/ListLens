import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk-config";

export default function SignInPage() {
  if (!isClerkConfigured()) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignIn />
    </main>
  );
}
