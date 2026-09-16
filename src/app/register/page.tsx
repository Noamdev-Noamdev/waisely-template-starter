/**
 * ---------------------------------------------------------------------------
 * RegisterPage (/register)
 * ---------------------------------------------------------------------------
 * Registratieformulier voor reguliere gebruikers (leerkrachten/scholen).
 * Nieuwe accounts krijgen altijd de rol "user" — de admin-rol wordt via de
 * seed toegewezen en kan nooit via dit formulier worden verkregen.
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/auth";
import Icon from "@/components/ui/Icon";

export const metadata = {
  title: "Account aanmaken",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col items-center px-4 py-16 sm:px-6 md:py-24">
      <div className="w-full max-w-md">
        <div className="rounded-[var(--radius)] bg-surface p-8 shadow-[var(--shadow-lg)]">
          <div className="mb-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-accent text-accent-foreground shadow-[var(--shadow-accent)]">
              <Icon name="user" size={22} />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-foreground">
              Account aanmaken
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Voor leerkrachten en scholen die workshops willen aanvragen en
              materialen willen downloaden.
            </p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            al een account?{" "}
            <Link
              href="/login"
              className="font-semibold text-accent transition-colors hover:text-accent-strong"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
