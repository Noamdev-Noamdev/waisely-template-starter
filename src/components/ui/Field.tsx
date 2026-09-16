/**
 * ---------------------------------------------------------------------------
 * Field.tsx — Herbruikbare formuliervelden met label + help-tekst
 * ---------------------------------------------------------------------------
 * Één set velden die auth-, boekings- én admin-formulieren deelt, met
 * consistent styling (field-input/field-label uit globals.css).
 * ---------------------------------------------------------------------------
 */

import type { ComponentProps, ReactNode } from "react";

/** Label met vaste opmaak. */
export function FieldLabel({
  children,
  htmlFor,
  required,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="field-label">
      {children}
      {required ? <span className="text-accent"> *</span> : null}
    </label>
  );
}

/** Standaard text/email/password input met consistent gedrag. */
export function FieldInput({
  label,
  id,
  help,
  ...props
}: {
  label?: string;
  help?: string;
} & ComponentProps<"input">) {
  return (
    <div>
      {label ? (
        <FieldLabel htmlFor={id} required={props.required}>
          {label}
        </FieldLabel>
      ) : null}
      <input id={id} className="field-input" {...props} />
      {help ? <p className="field-help">{help}</p> : null}
    </div>
  );
}

/** Meerregelig tekstveld. */
export function FieldTextarea({
  label,
  id,
  help,
  ...props
}: {
  label?: string;
  help?: string;
} & ComponentProps<"textarea">) {
  return (
    <div>
      {label ? (
        <FieldLabel htmlFor={id} required={props.required}>
          {label}
        </FieldLabel>
      ) : null}
      <textarea id={id} className="field-input min-h-24 resize-y" {...props} />
      {help ? <p className="field-help">{help}</p> : null}
    </div>
  );
}

/** Select-dropdown (bv. voor type workshop, status boekingen). */
export function FieldSelect({
  label,
  id,
  help,
  children,
  ...props
}: {
  label?: string;
  help?: string;
} & ComponentProps<"select">) {
  return (
    <div>
      {label ? (
        <FieldLabel htmlFor={id} required={props.required}>
          {label}
        </FieldLabel>
      ) : null}
      <select id={id} className="field-input appearance-none bg-surface" {...props}>
        {children}
      </select>
      {help ? <p className="field-help">{help}</p> : null}
    </div>
  );
}
