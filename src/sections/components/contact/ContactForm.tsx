import { useState } from 'react';
import type { FormEvent } from 'react';
import { Mail, Send } from 'lucide-react';
import type { Backend } from './types';
import { Field, Honeypot, Status, fieldValue, focusError } from './FormParts';
import type { FormStatus } from './FormParts';

export default function ContactForm({ backend }: { backend: Backend | null }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<FormStatus | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !backend) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const input = {
      name: fieldValue(data, 'name'), email: fieldValue(data, 'email'),
      subject: fieldValue(data, 'subject'), message: fieldValue(data, 'message'),
      honeypot: fieldValue(data, 'website'),
    };
    const next: Record<string, string> = {};
    if ([...input.name].length < 2 || [...input.name].length > 80) next.name = 'Please enter your full name (2–80 characters).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email) || input.email.length > 120) next.email = 'Please enter a valid email address.';
    if ([...input.subject].length < 3 || [...input.subject].length > 100) next.subject = 'Please add a subject (3–100 characters).';
    if ([...input.message].length < 10 || [...input.message].length > 2000) next.message = 'Message must be 10–2000 characters.';
    setErrors(next); setStatus(null);
    if (Object.keys(next).length) { focusError(form); return; }
    setBusy(true);
    try {
      await backend.submitPrivate(input);
      form.reset();
      setStatus({ kind: 'ok', text: 'Your message was received by the contact service. Email delivery is not confirmed.' });
    } catch (error) {
      setStatus({ kind: 'err', text: error instanceof Error ? error.message : 'Your message could not be sent. Please try again.' });
    } finally { setBusy(false); }
  }
  const attributes = (name: string) => ({
    id: `contact-private-${name}`, name, required: true,
    'aria-invalid': Boolean(errors[name]), 'aria-describedby': `contact-private-${name}-err`,
    onChange: () => setErrors((previous) => ({ ...previous, [name]: '' })),
  });
  return <article className="card private-card" aria-labelledby="contact-private-title">
    <div className="card__head"><h3 id="contact-private-title"><Mail className="icon" aria-hidden="true" />Send a Private Message</h3></div>
    <form onSubmit={submit} noValidate aria-label="Send a private message">
      <Field id="contact-private-name" label="Full name" error={errors.name}>
        <input className="input" {...attributes('name')} type="text" maxLength={80} autoComplete="name" placeholder="e.g. Alex Morgan" />
      </Field>
      <Field id="contact-private-email" label="Email address" error={errors.email}>
        <input className="input" {...attributes('email')} type="email" maxLength={120} autoComplete="email" placeholder="alex@example.com" />
      </Field>
      <Field id="contact-private-subject" label="Subject" error={errors.subject}>
        <input className="input" {...attributes('subject')} type="text" maxLength={100} placeholder="Project inquiry / collaboration" />
      </Field>
      <Field id="contact-private-message" label="Message" error={errors.message}>
        <textarea className="textarea" {...attributes('message')} maxLength={2000} rows={4} placeholder="Write your message here..." />
      </Field>
      <Honeypot />
      {backend?.mode === 'preview' && <p className="preview-count">Private message delivery is not connected. This form will not send or store your message.</p>}
      <div className="form-actions"><button className="btn" type="submit" disabled={busy || !backend}>
        <Send className="icon" aria-hidden="true" />{busy ? 'Sending…' : 'Send Message'}
      </button></div>
      <Status status={status} />
    </form>
  </article>;
}
