/**
 * Admin page — View intake form submissions
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { get } from "@/lib/db";
import IntakeSubmissionsViewer from "@/components/admin/IntakeSubmissionsViewer";

export const metadata = { title: "Intake-inzendingen" };

export default async function IntakeSubmissionsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const submissions = await get("intakeSubmissions");
  const fields = await get("intakeFields");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Intake-inzendingen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overzicht van alle ingevulde intake-formulieren. Klik op een inzending voor de details.
        </p>
      </div>
      <IntakeSubmissionsViewer initialSubmissions={submissions} fields={fields} />
    </div>
  );
}
