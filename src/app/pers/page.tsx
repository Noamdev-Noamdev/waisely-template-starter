/**
 * ---------------------------------------------------------------------------
 * PersPage (/pers) — Press, Instagram & Reviews
 * ---------------------------------------------------------------------------
 */

import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import Badge from "@/components/ui/Badge";
import { ButtonExternal } from "@/components/ui/Button";
import { get } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Pers, reviews & Instagram",
  description:
    "Persvermeldingen, reviews van deelnemers en de laatste Instagram-posts van WAIsely.",
};

export default async function PersPage() {
  const news = await get("news");
  const pressItems = news.filter((n) => n.type === "press");

  // Placeholder reviews
  const reviews = [
    {
      name: "Lisa D.",
      role: "Leerkracht Engels, 3de graad",
      text: "Eindelijk iemand die begrijpt dat wij leerkrachten geen techneuten zijn. De workshop was concreet, praktisch en ik kon alles meteen gebruiken in mijn lessen.",
    },
    {
      name: "Tom V.",
      role: "ICT-coördinator, scholengroep",
      text: "Sabrina's aanpak is uniek: ze vertrekt altijd vanuit de les, niet vanuit de tool. Dat maakt het verschil. Onze leerkrachten voelden zich gehoord.",
    },
    {
      name: "An S.",
      role: "Directeur hoger onderwijs",
      text: "We hadden WAIsely uitgenodigd voor een studiedag. De feedback van onze docenten was unaniem positief. Praktisch, duidelijk en inspirerend.",
    },
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 md:py-20">
      {/* Header */}
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Pers & reviews
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Wat anderen zeggen
        </h1>
        <p className="prose-muted mt-4 max-w-2xl">
          Persvermeldingen, ervaringen van deelnemers en de laatste posts van
          WAIsely op Instagram.
        </p>
      </Reveal>

      {/* Reviews */}
      <section className="mt-16">
        <Reveal>
          <h2 className="text-2xl font-medium text-foreground">
            Ervaringen van deelnemers
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reviews.map((review, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="card-hover flex h-full flex-col rounded-[var(--radius)] bg-surface p-6 shadow-[var(--shadow-md)]">
                <Icon
                  name="quote"
                  size={24}
                  className="text-accent/40"
                />
                <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground">
                    {review.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.role}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Press mentions */}
      {pressItems.length > 0 ? (
        <section className="mt-16">
          <Reveal>
            <h2 className="text-2xl font-medium text-foreground">
              In de pers
            </h2>
          </Reveal>
          <div className="mt-8 space-y-4">
            {pressItems.map((item, i) => (
              <Reveal key={item.id} delay={i * 100}>
                <a
                  href={item.externalUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-hover flex items-center justify-between gap-4 rounded-[var(--radius)] bg-surface p-5 shadow-[var(--shadow-md)] transition-colors hover:bg-surface-muted"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-background text-accent">
                      <Icon name="news" size={18} />
                    </span>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.excerpt}
                      </p>
                      <time
                        dateTime={item.date}
                        className="mt-2 block text-xs text-muted-foreground"
                      >
                        {formatDate(item.date)}
                      </time>
                    </div>
                  </div>
                  <Icon
                    name="external"
                    size={16}
                    className="shrink-0 text-muted-foreground"
                  />
                </a>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* Instagram placeholder */}
      <section className="mt-16">
        <Reveal>
          <h2 className="text-2xl font-medium text-foreground">
            Volg WAIsely op Instagram
          </h2>
          <p className="prose-muted mt-2">
            Dagelijkse tips, lesideeën en AI-inspiratie voor leerkrachten.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <a
                key={i}
                href="https://www.instagram.com/waisely"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex aspect-square items-center justify-center rounded-[var(--radius)] bg-surface shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]"
              >
                <div className="text-center">
                  <Icon
                    name="heart"
                    size={24}
                    className="mx-auto text-muted-foreground/40 transition-colors group-hover:text-accent"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Instagram post
                  </p>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-6">
            <ButtonExternal href="https://www.instagram.com/waisely">
              <Icon name="heart" size={16} />
              Volg op Instagram
            </ButtonExternal>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
