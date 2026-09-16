/**
 * ---------------------------------------------------------------------------
 * LoginPage (/login)
 * ---------------------------------------------------------------------------
 * Inlogformulier met foutafhandeling. Na succesvolle login gaat een admin
 * naar het admin-paneel, een reguliere gebruiker naar het dashboard.
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_EMAIL, DEMO_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD } from "@/lib/seed";
import Icon from "@/components/ui/Icon";

export const metadata = {
  title: "Inloggen",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col items-center px-4 py-16 sm:px-6 md:py-24">
      <div className="w-full max-w-md">
        {/* Kaart met subtiele diepte */}
        <div className="rounded-[var(--radius)] bg-surface p-8 shadow-[var(--shadow-lg)]">
          <div className="mb-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-accent text-accent-foreground shadow-[var(--shadow-accent)]">
              <Icon name="lock" size={22} />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-foreground">
              Welkom terug
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Log in om je boekingen en de kennisbank te bekijken.
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Nog geen account?{" "}
            <Link
              href="/register"
              className="font-semibold text-accent transition-colors hover:text-accent-strong"
            >
              Maak er één aan
            </Link>
          </p>
        </div>

        {/* Demo-inloggegevens voor de template (verwijder in productie). */}
        <div className="mt-4 rounded-[var(--radius)] border border-dashed border-border bg-surface-muted p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Template-accounts:</p>
          <p className="mt-1.5">
            Admin: <code className="text-accent">{ADMIN_EMAIL}</code> /{" "}
            <code className="text-accent">{ADMIN_PASSWORD}</code>
          </p>
          <p>
            Gebruiker: <code className="text-accent">{DEMO_EMAIL}</code> /{" "}
            <code className="text-accent">{DEMO_PASSWORD}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
