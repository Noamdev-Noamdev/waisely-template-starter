/**
 * ---------------------------------------------------------------------------
 * AdminLayout (src/app/admin/layout.tsx)
 * ---------------------------------------------------------------------------
 * Aparte admin-omgeving: een zijbalk met alle beheerplekken (content, aanvragen,
 * kennisbank, nieuws, gebruikers). Alleen toegankelijk voor de admin-rol; alle
 * onderliggende pagina's erven deze beveiliging mee via deze layout-check.
 * ---------------------------------------------------------------------------
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Beveiliging op layout-niveau: elke /admin/*-pagina vereist de admin-rol.
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div className="mx-auto flex max-w-[1000px] gap-8 px-4 py-10 sm:px-6 md:py-14">
      <AdminSidebar userName={user.name} />
      {/* Content-gedeelte; kinderen zijn de losse beheerpagina's */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
