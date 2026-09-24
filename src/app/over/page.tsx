/**
 * ---------------------------------------------------------------------------
 * OverPage (/over) — Bio page for Sabrina Carota
 * ---------------------------------------------------------------------------
 */

import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { get } from "@/lib/db";

export const metadata = {
  title: "Wie is WAIsely?",
  description:
    "Maak kennis met Sabrina Carota — leerkracht Engels, taalwetenschapper en oprichtster van WAIsely.",
};

export default async function OverPage() {
  const content = await get("siteContent");

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        {/* Portrait block */}
        <Reveal>
          <div className="relative">
            <div
              className="absolute -left-3 -top-3 h-full w-full rounded-[var(--radius)] bg-surface"
              aria-hidden
            />
            <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-[var(--radius)] bg-surface-muted shadow-[var(--shadow-lg)]">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-background text-accent shadow-[var(--shadow-md)]">
                <Icon name="user" size={40} />
              </span>
              <p className="mt-5 text-lg font-medium text-foreground">
                Sabrina Carota
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Leerkracht · Taalwetenschapper · AI-trainer
              </p>
            </div>
          </div>
        </Reveal>

        {/* Bio text */}
        <Reveal delay={150}>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Over
            </p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {content.about.title}
            </h1>
            <div className="prose-muted mt-6 space-y-4 whitespace-pre-line">
              <p>{content.about.body}</p>
            </div>

            {/* Highlights */}
            <ul className="mt-10 space-y-5">
              {content.about.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-accent shadow-[var(--shadow-sm)]">
                    <Icon name="check" size={16} />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{h.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {h.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Vision section */}
            <div className="mt-12 rounded-[var(--radius)] bg-surface p-6 shadow-[var(--shadow-md)]">
              <h2 className="text-xl font-medium text-foreground">
                Mijn visie
              </h2>
              <p className="prose-muted mt-3">
                AI is geen bedreiging voor onderwijs — het is een kans. Maar
                alleen als we het doordacht en verantwoord inzetten. Ik geloof
                dat elke leerkracht de ruimte en begeleiding verdient om op
                eigen tempo te ontdekken wat AI voor hen kan betekenen. Niet
                vanuit druk, maar vanuit nieuwsgierigheid. Niet vanuit angst,
                maar vanuit vertrouwen.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/boek-een-training">
                Boek een training
                <Icon name="arrow-right" size={16} />
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Neem contact op
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
