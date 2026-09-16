/**
 * ---------------------------------------------------------------------------
 * Contact.tsx — Contact section with form + details
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { FieldInput, FieldTextarea } from "@/components/ui/Field";
import type { SiteContent } from "@/lib/types";

export default function Contact({ content }: { content: SiteContent }) {
  const { contact } = content;
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact details */}
          <Reveal>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Contact
              </p>
              <h2 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {contact.title}
              </h2>
              <p className="prose-muted mt-4 max-w-md">{contact.body}</p>

              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-surface text-accent">
                    <Icon name="mail" size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      E-mail
                    </p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="font-medium text-foreground transition-colors hover:text-accent"
                    >
                      {contact.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-surface text-accent">
                    <Icon name="phone" size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Telefoon
                    </p>
                    <p className="font-medium text-foreground">{contact.phone}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-surface text-accent">
                    <Icon name="map-pin" size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Locatie
                    </p>
                    <p className="font-medium text-foreground">{contact.address}</p>
                  </div>
                </li>
              </ul>
            </div>
          </Reveal>

          {/* Contact form */}
          <Reveal delay={150}>
            <form
              onSubmit={handleSubmit}
              className="rounded-[var(--radius)] bg-surface p-6 shadow-[var(--shadow-lg)] sm:p-8"
            >
              <h3 className="text-lg font-medium text-foreground">
                Stuur een bericht
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ik reageer doorgaans binnen 2 werkdagen.
              </p>

              <div className="mt-6 space-y-4">
                <FieldInput
                  label="Naam"
                  id="contact-name"
                  name="name"
                  placeholder="Jouw naam"
                  required
                />
                <FieldInput
                  label="E-mailadres"
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="jij@school.be"
                  required
                />
                <FieldTextarea
                  label="Bericht"
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Waarmee kan ik helpen?"
                  required
                />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Versturen…" : "Verstuur bericht"}
                  {status !== "sending" && <Icon name="arrow-right" size={15} />}
                </Button>
                {status === "sent" ? (
                  <p className="text-sm font-medium text-emerald-600">
                    Bedankt! Je bericht is verstuurd.
                  </p>
                ) : null}
                {status === "error" ? (
                  <p className="text-sm font-medium text-red-600">
                    Er ging iets mis. Probeer het later opnieuw.
                  </p>
                ) : null}
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
