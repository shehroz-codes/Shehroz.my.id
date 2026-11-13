import type { ReactNode } from 'react';

export interface FormStatus { kind: 'ok' | 'err' | 'warn'; text: string }
export function Status({ status }: { status: FormStatus | null }) {
  return <p className={`status${status ? ` status--${status.kind}` : ''}`} role="status" aria-live="polite" hidden={!status}>{status?.text}</p>;
}
export function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return <div className="field">
    <label htmlFor={id}><span>{label} <span className="req" aria-hidden="true">*</span></span></label>
    {children}
    <p id={`${id}-err`} className="error" role="alert">{error}</p>
  </div>;
}
export function Honeypot() {
  return <div className="hp" aria-hidden="true"><label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>;
}
export const fieldValue = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
export function focusError(form: HTMLFormElement) {
  // React applies aria-invalid in the next render.
  requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}
