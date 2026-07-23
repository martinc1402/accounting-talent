import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Employer sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-mist">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center px-5 lg:h-[72px] lg:px-8">
          <Logo />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-5 py-12">
        <LoginForm />
        <p className="mt-4 text-center text-caption text-subtle">
          Employer accounts are how firms request candidate introductions.
        </p>
      </main>
    </div>
  );
}
