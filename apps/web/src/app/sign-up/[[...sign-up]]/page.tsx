import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk-config";

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUp />
    </main>
  );
}
