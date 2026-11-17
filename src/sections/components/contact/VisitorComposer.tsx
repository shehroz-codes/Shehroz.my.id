import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Clock, Globe, Image as ImageIcon, Pencil, Send, X } from 'lucide-react';
import { ContactError } from './types';
import type { Backend, Country } from './types';
import { wallSettings } from './config';
import { correct } from './services/suggest';
import { setLiveExpiry } from './services/storage';
import { Field, Honeypot, Status, fieldValue, focusError } from './FormParts';
import type { FormStatus } from './FormParts';

import { thumbnail } from './services/photo';

export default function VisitorComposer({ backend, remaining, cooldownLabel }: {
  backend: Backend | null; remaining: number; cooldownLabel: string;
}) {
  const [name, setName] = useState(() => { try { return sessionStorage.getItem('visitor-draft-name') ?? ''; } catch { return ''; } });
  const [text, setText] = useState(() => { try { return sessionStorage.getItem('visitor-draft-text') ?? ''; } catch { return ''; } });
  useEffect(() => { try { sessionStorage.setItem('visitor-draft-name', name); sessionStorage.setItem('visitor-draft-text', text); } catch { /* Draft still works without storage. */ } }, [name, text]);
  const [suggestion, setSuggestion] = useState('');
  const [dismissed, setDismissed] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<FormStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [readingPhoto, setReadingPhoto] = useState(false);
  const [photo, setPhoto] = useState<{ file: File; dataUrl: string } | null>(null);
  const [detected, setDetected] = useState<Country>({ code: null, name: null });
  const [detectingCountry, setDetectingCountry] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const photoSequence = useRef(0);
  useEffect(() => {
    let cancelled = false;
    if (!backend) return;
    setDetectingCountry(true);
    void backend.detectCountry().then((country) => { if (!cancelled) setDetected(country); })
      .catch(() => { if (!cancelled) setDetected({ code: null, name: null }); })
      .finally(() => { if (!cancelled) setDetectingCountry(false); });
    return () => { cancelled = true; };
  }, [backend]);
  useEffect(() => () => { photoSequence.current++; }, []);
  useEffect(() => {
    setSuggestion('');
    const timer = setTimeout(() => {
      const trimmed = text.trim();
      if (trimmed.length < 4 || !/[A-Za-z]{2}/.test(trimmed)) return;
      const result = correct(trimmed);
      if (result !== trimmed && result !== dismissed && result.length <= 300) setSuggestion(result);
    }, 700);
    return () => clearTimeout(timer);
  }, [text, dismissed]);
  const country = detected;
  const unavailable = backend?.submissionsEnabled === false;
  const disabled = busy;
  const submitDisabled = busy || readingPhoto || remaining > 0 || !backend || unavailable;
  function clearPhoto() {
    photoSequence.current++; setPhoto(null); setReadingPhoto(false);
    if (fileRef.current) fileRef.current.value = '';
  }
  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    clearPhoto();
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > wallSettings.maxPhotoBytes) {
      setStatus({ kind: 'err', text: 'Choose a JPG, PNG or WebP photo up to 2 MB.' }); return;
    }
    const sequence = ++photoSequence.current;
    setReadingPhoto(true); setStatus(null);
    try {
      const prepared = await thumbnail(file);
      if (sequence === photoSequence.current) setPhoto(prepared);
    } catch {
      if (sequence === photoSequence.current) setStatus({ kind: 'err', text: 'This photo could not be read. Please choose another image.' });
    } finally { if (sequence === photoSequence.current) setReadingPhoto(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitDisabled || submitting.current || !backend) return;
    const data = new FormData(event.currentTarget);
    const name = fieldValue(data, 'name').normalize('NFC');
    const trimmed = text.trim().normalize('NFC');
    const next: Record<string, string> = {};
    if (!name || name.length > 80) next.name = 'Please enter your name (up to 80 characters).';
    if (!trimmed || trimmed.length > 300) next.text = 'Please write a message of 1–300 characters.';
    setErrors(next); setStatus(null);
    if (Object.keys(next).length) { focusError(event.currentTarget); return; }
    submitting.current = true; setBusy(true);
    try {
      const result = await backend.submitPublic({
        name, text: trimmed, photo: photo?.file ?? null, photoDataUrl: photo?.dataUrl ?? null,
        country, honeypot: fieldValue(data, 'website'),
      });
      if (backend.mode === 'live') setLiveExpiry(result.cooldownUntil);
      setText(''); setName(''); setSuggestion(''); clearPhoto();
      setStatus({
        kind: result.status === 'pending' ? 'warn' : 'ok',
        text: backend.mode === 'preview'
          ? 'Preview saved in this browser only. It is not published to the public wall.'
          : result.status === 'published' ? 'Your message is live on the visitor wall.' : 'Your message was received and is waiting for review.',
      });
    } catch (error) {
      if (backend.mode === 'live' && error instanceof ContactError && error.cooldownUntil) setLiveExpiry(error.cooldownUntil);
      setStatus({ kind: 'err', text: error instanceof Error ? error.message : 'Your message could not be posted. Please try again.' });
    } finally {
      submitting.current = false; setBusy(false);
    }
  }

  return <article className="card composer-card" aria-labelledby="contact-composer-title">
    <div className="card__head"><h3 id="contact-composer-title"><Pencil className="icon" aria-hidden="true" />Write a Public Message</h3></div>
    {remaining > 0 && <div className="cooldown" role="status"><Clock className="icon" aria-hidden="true" />
      <span>You can post again in <time dateTime={`PT${Math.ceil(remaining / 1000)}S`}>{cooldownLabel}</time></span>
    </div>}
    <form className="composer" onSubmit={submit} noValidate aria-label="Write a public message">
      <fieldset disabled={disabled}>
        <legend className="sr-only">Write a public message</legend>
        <div className="composer__inner">
          <div className="composer__compact-row">
            <Field id="contact-public-name" label="Your name" error={errors.name}>
              <input className="input" id="contact-public-name" name="name" maxLength={80} required autoComplete="nickname"
                aria-invalid={Boolean(errors.name)} aria-describedby="contact-public-name-err" placeholder="Your name or alias"
                value={name} onChange={(event) => { setName(event.target.value); setErrors((old) => ({ ...old, name: '' })); }} />
            </Field>
            <div className="field photo-ctrl-field">
              <label htmlFor="contact-photo"><span>Photo <span className="opt">(optional)</span></span></label>
              <div className="photo-ctrl">
                <input ref={fileRef} type="file" id="contact-photo" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} tabIndex={-1} />
                <button className="btn btn--ghost" type="button" disabled={backend?.photosEnabled === false} onClick={() => fileRef.current?.click()}>
                  <ImageIcon className="icon" aria-hidden="true" />Choose photo
                </button>
                {photo && <span className="photo-thumb">
                  <img src={photo.dataUrl} alt="Selected photo preview" />
                  <button type="button" onClick={clearPhoto} aria-label="Remove photo"><X className="icon" aria-hidden="true" /></button>
                </span>}
              </div>
              {backend?.photosEnabled === false && <p className="preview-count">Photos are unavailable until secure photo delivery is connected.</p>}
            </div>
          </div>
          <div className="field composer__text-field">
            <label htmlFor="contact-public-text"><span>Your message <span className="req" aria-hidden="true">*</span></span>
              <span className={`composer__counter${text.length >= 270 ? ' is-near' : ''}`} id="contact-counter">{text.length} / 300</span>
            </label>
            <textarea ref={textRef} className="textarea" id="contact-public-text" name="text" rows={3} maxLength={300} required
              value={text} aria-invalid={Boolean(errors.text)} aria-describedby="contact-public-text-err contact-counter"
              onChange={(event) => { setText(event.target.value); setErrors((old) => ({ ...old, text: '' })); }}
              onKeyDown={(event) => { if (event.key === 'Escape') { setDismissed(suggestion); setSuggestion(''); } }}
              placeholder="Say hello or leave a note on the wall..." />
            <p className="error" id="contact-public-text-err" role="alert">{errors.text}</p>
          </div>
          <Honeypot />
          <div className="composer__country-section">
            <div className="country-line" role="status"><Globe className="icon" aria-hidden="true" />
              {detectingCountry ? 'Detecting country…' : country.code && country.name
                ? `${country.name} · ${backend?.mode === 'preview' ? 'Local preview' : 'Approximate network location'}`
                : backend ? 'Country unavailable' : 'Country is detected automatically'}
            </div>
          </div>
          {suggestion && <div className="suggest" role="status">
            <span>✨ Did you mean:</span><strong>{suggestion}</strong>
            <button type="button" className="btn btn--ghost suggest__use-btn" onClick={() => { setText(suggestion); textRef.current?.focus(); }}>Use suggestion</button>
            <button type="button" className="x" aria-label="Dismiss suggestion" onClick={() => { setDismissed(suggestion); setSuggestion(''); textRef.current?.focus(); }}><X className="icon" aria-hidden="true" /></button>
          </div>}
          {unavailable && <p className="preview-count" role="status">Public submissions are not enabled yet. You can prepare a draft here.</p>}
          <div className="composer__actions"><button className="btn" type="submit" disabled={submitDisabled}>
            <Send className="icon" aria-hidden="true" />{busy ? 'Posting…' : readingPhoto ? 'Reading photo…' : backend?.mode === 'preview' ? 'Preview Message' : 'Post Message'}
          </button></div>
        </div>
      </fieldset>
    </form>
    <Status status={status} />
  </article>;
}
