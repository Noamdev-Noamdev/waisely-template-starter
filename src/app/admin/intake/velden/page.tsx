/**
 * Admin page — Intake form field management
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { get } from "@/lib/db";
import IntakeFieldsManager from "@/components/admin/IntakeFieldsManager";

export const metadata = { title: "Intake-velden beheren" };

export default async function IntakeFieldsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const fields = await get("intakeFields");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Intake-formulier velden</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Beheer de vragen van het intake-formulier. Voeg velden toe, pas labels aan, wijzig het type of verwijder velden.
        </p>
      </div>
      <IntakeFieldsManager initialFields={fields} />
    </div>
  );
}
