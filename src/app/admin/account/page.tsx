/**
 * ---------------------------------------------------------------------------
 * AdminAccountPage (/admin/account)
 * ---------------------------------------------------------------------------
 * Accountbeheer voor admins en superadmins:
 *   - Accountgegevens inzien (naam, e-mail, rol)
 *   - Eigen wachtwoord veilig wijzigen
 * ---------------------------------------------------------------------------
 */

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/Badge";
import PasswordChangeForm from "@/components/auth/PasswordChangeForm";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Mijn account — Admin",
};

export default async function AdminAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isSuper = user.role === "superadmin";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mijn account & beveiliging
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Beheer je inloggegevens en wijzig hier je wachtwoord.
        </p>
      </div>

      {/* Accountinfo overzichtskaart */}
      <div className="mb-8 rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Accountgegevens
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Naam
            </dt>
            <dd className="mt-1 font-medium text-foreground">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              E-mailadres
            </dt>
            <dd className="mt-1 font-medium text-foreground">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Rol
            </dt>
            <dd className="mt-1">
              <Badge tone={isSuper ? "neutral" : "warning"}>
                {isSuper ? "Superadmin (Eigenaar)" : "Admin"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Lid sinds
            </dt>
            <dd className="mt-1 text-muted-foreground">
              {formatDate(user.createdAt)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Wachtwoord wijzigen */}
      <div className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-foreground">
            Wachtwoord wijzigen
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Kies een sterk nieuw wachtwoord van minstens 8 tekens.
            Na het opslaan worden alle andere actieve sessies van dit account direct beëindigd.
          </p>
        </div>

        <PasswordChangeForm />
      </div>
    </div>
  );
}
