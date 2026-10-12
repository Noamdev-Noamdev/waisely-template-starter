/**
 * ---------------------------------------------------------------------------
 * PersPage (/pers) — Press, Instagram & Reviews
 * ---------------------------------------------------------------------------
 * Alle teksten, reviews en Instagram-posts komen uit siteContent.press en
 * zijn bewerkbaar via /admin/content/pers. Persvermeldingen komen uit
 * "Nieuws & pers" (items met type "press").
 * ---------------------------------------------------------------------------
 */

import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { ButtonExternal } from "@/components/ui/Button";
import InstagramEmbeds from "@/components/site/InstagramEmbeds";
import { get } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Pers, reviews & Instagram",
  description:
    "Persvermeldingen, reviews van deelnemers en de laatste Instagram-posts van WAIsely.",
};

export default async function PersPage() {
  const [news, content] = await Promise.all([get("news"), get("siteContent")]);
  const press = content.press;
  const pressItems = news.filter((n) => n.type === "press");
  const reviews = press.reviews.filter((r) => r.visible);
  const instagramUrls = press.instagramPosts
    .filter((p) => p.visible)
    .map((p) => p.url);
  const profileUrl =
    press.instagramProfileUrl || content.footer.instagramUrl || "";

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 md:py-20">
      {/* Header */}
      <Reveal>
        {press.eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {press.eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {press.title}
        </h1>
        {press.intro ? (
          <p className="prose-muted mt-4 max-w-2xl whitespace-pre-line">
            {press.intro}
          </p>
        ) : null}
      </Reveal>

      {/* Press mentions */}
      {pressItems.length > 0 ? (
        <section className="mt-16">
          <Reveal>
            <h2 className="text-2xl font-medium text-foreground">
              {press.pressTitle}
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

      {/* Instagram */}
      {instagramUrls.length > 0 || profileUrl ? (
        <section className="mt-16">
          <Reveal>
            <h2 className="text-2xl font-medium text-foreground">
              {press.instagramTitle}
            </h2>
            {press.instagramSubtitle ? (
              <p className="prose-muted mt-2">{press.instagramSubtitle}</p>
            ) : null}
          </Reveal>
          {instagramUrls.length > 0 ? (
            <div className="mt-8">
              <InstagramEmbeds urls={instagramUrls} />
            </div>
          ) : null}
          {profileUrl ? (
            <div className="mt-8">
              <ButtonExternal href={profileUrl}>
                <Icon name="instagram" size={16} />
                {press.instagramButtonLabel || "Volg op Instagram"}
              </ButtonExternal>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Reviews */}
      {reviews.length > 0 ? (
        <section className="mt-16">
          <Reveal>
            <h2 className="text-2xl font-medium text-foreground">
              {press.reviewsTitle}
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={review.id} delay={(i % 3) * 100}>
                <div className="card-hover flex h-full flex-col rounded-[var(--radius)] bg-surface p-6 shadow-[var(--shadow-md)]">
                  <Icon
                    name="quote"
                    size={24}
                    className="text-accent/40"
                  />
                  <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-foreground">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-sm font-medium text-foreground">
                      {review.name}
                    </p>
                    {review.role ? (
                      <p className="text-xs text-muted-foreground">
                        {review.role}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
