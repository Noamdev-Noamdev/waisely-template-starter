/**
 * ---------------------------------------------------------------------------
 * ModuleSelector.tsx — Interactive module card selector
 * ---------------------------------------------------------------------------
 * Client component: users can select up to 3 modules to combine into
 * a custom 2-hour workshop. A sticky bar appears at the bottom showing
 * the selection and a CTA to request the workshop.
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import type { Service } from "@/lib/types";

const MAX_MODULES = 3;

export default function ModuleSelector({ modules }: { modules: Service[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < MAX_MODULES
        ? [...prev, id]
        : prev
    );
  }

  const selectedModules = modules.filter((m) => selected.includes(m.id));
  const queryParam = selectedModules.map((m) => m.title).join(" + ");

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules
          .sort((a, b) => a.order - b.order)
          .map((mod, i) => {
            const isSelected = selected.includes(mod.id);
            const canSelect = selected.length < MAX_MODULES || isSelected;

            return (
              <Reveal key={mod.id} delay={i * 80}>
                <button
                  type="button"
                  onClick={() => toggle(mod.id)}
                  disabled={!canSelect && !isSelected}
                  className={`card-hover group flex h-full w-full flex-col rounded-[var(--radius)] p-6 text-left transition-all ${
                    isSelected
                      ? "bg-accent text-accent-foreground shadow-[var(--shadow-lg)] ring-2 ring-accent"
                      : "bg-surface shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
                  } ${!canSelect && !isSelected ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-[var(--radius)] transition-colors ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-background text-accent group-hover:bg-accent group-hover:text-accent-foreground"
                      }`}
                    >
                      <Icon name={mod.icon} size={22} />
                    </div>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                        isSelected
                          ? "border-white bg-white text-accent"
                          : "border-border bg-background"
                      }`}
                    >
                      {isSelected ? <Icon name="check" size={14} /> : null}
                    </div>
                  </div>

                  <h3
                    className={`mt-4 text-lg font-medium leading-snug ${
                      isSelected ? "text-white" : "text-foreground"
                    }`}
                  >
                    {mod.title}
                  </h3>
                  <p
                    className={`mt-2 flex-1 text-sm leading-relaxed ${
                      isSelected ? "text-white/75" : "text-muted-foreground"
                    }`}
                  >
                    {mod.description}
                  </p>

                  <div
                    className={`mt-4 flex flex-wrap items-center gap-2 text-xs ${
                      isSelected ? "text-white/60" : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                        isSelected ? "bg-white/10" : "bg-background"
                      }`}
                    >
                      <Icon name="clock" size={12} />
                      {mod.duration}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                        isSelected ? "bg-white/10" : "bg-background"
                      }`}
                    >
                      <Icon name="users" size={12} />
                      {mod.audience}
                    </span>
                  </div>
                </button>
              </Reveal>
            );
          })}
      </div>

      {/* Sticky selection bar */}
      {selected.length > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <div className="mx-auto flex max-w-[1000px] flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {selected.length}/{MAX_MODULES} modules:
              </span>
              {selectedModules.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                >
                  {m.title}
                  <button
                    type="button"
                    onClick={() => toggle(m.id)}
                    className="ml-1 hover:text-white/70"
                    aria-label={`${m.title} verwijderen`}
                  >
                    <Icon name="close" size={12} />
                  </button>
                </span>
              ))}
            </div>
            <ButtonLink
              href={`/boeken?dienst=${encodeURIComponent(queryParam)}`}
            >
              Workshop aanvragen
              <Icon name="arrow-right" size={16} />
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </>
  );
}
