import Link from "next/link";
import Icon from "@/components/ui/Icon";

/**
 * 404 page — friendly "page not found" flow.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1000px] flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-accent shadow-[var(--shadow-md)]">
        <Icon name="search" size={24} />
      </span>
      <h1 className="mt-6 text-3xl font-medium tracking-tight text-foreground">
        Pagina niet gevonden
      </h1>
      <p className="prose-muted mt-3 max-w-md">
        Deze pagina bestaat niet (meer). Ga terug naar de homepage of neem
        contact op als je denkt dat dit een fout is.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wider text-accent-foreground shadow-[var(--shadow-accent)] transition-all hover:-translate-y-0.5 hover:bg-accent-strong"
      >
        <Icon name="arrow-left" size={15} />
        Terug naar de homepage
      </Link>
    </div>
  );
}
