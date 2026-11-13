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
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { turnstileSiteKey } from './config';

const countries = ['PK', 'IN', 'AE', 'SA', 'GB', 'US', 'CA', 'DE', 'FR', 'AU', 'TR', 'SG', 'BD', 'MY', 'QA', 'KW', 'OM', 'NL', 'SE', 'CH', 'IT', 'ES', 'BR', 'JP', 'CN'];
const names = new Intl.DisplayNames(['en'], { type: 'region' });

/** Source's square thumbnail crop, limited to 160px for browser-only preview. */
async function thumbnail(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = url;
    await image.decode();
    if (image.width * image.height > 20_000_000) throw new Error('Please choose a smaller image.');
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 160;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Photo preview is unavailable.');
    const edge = Math.min(image.width, image.height);
    context.drawImage(image, (image.width - edge) / 2, (image.height - edge) / 2, edge, edge, 0, 0, 160, 160);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally { URL.revokeObjectURL(url); }
}

export default function VisitorComposer({ backend, remaining, cooldownLabel }: {
  backend: Backend | null; remaining: number; cooldownLabel: string;
}) {
  const [text, setText] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [dismissed, setDismissed] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<FormStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const captchaRef = useRef<TurnstileInstance>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [readingPhoto, setReadingPhoto] = useState(false);
  const [photo, setPhoto] = useState<{ file: File; dataUrl: string } | null>(null);
  const [detected, setDetected] = useState<Country>({ code: null, name: null });
  const [countryChoice, setCountryChoice] = useState('auto');
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const photoSequence = useRef(0);
  useEffect(() => {
    let cancelled = false;
    void backend?.detectCountry().then((country) => { if (!cancelled) setDetected(country); });
    return () => { cancelled = true; };
  }, [backend]);
  useEffect(() => () => { photoSequence.current++; }, []);
  useEffect(() => {
    setSuggestion('');
    const timer = setTimeout(() => {
      const trimmed = text.trim();
      if (trimmed.length < 4 || !/[A-Za-z]{2}/.test(trimmed)) return;
      const result = correct(trimmed);
      if (result !== trimmed && result !== dismissed && [...result].length <= 300) setSuggestion(result);
    }, 700);
    return () => clearTimeout(timer);
  }, [text, dismissed]);
  const country: Country = countryChoice === 'auto' ? detected
    : { code: countryChoice || null, name: countryChoice ? names.of(countryChoice) ?? countryChoice : null };
  const unavailable = backend?.submissionsEnabled === false;
  const disabled = busy || readingPhoto || remaining > 0 || !backend || unavailable;
  const submitDisabled = disabled || Boolean(backend?.requiresCaptcha && (!turnstileSiteKey || !captchaToken));

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
      const dataUrl = await thumbnail(file);
      if (sequence === photoSequence.current) setPhoto({ file, dataUrl });
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
        turnstileToken: captchaToken,
      });
      if (backend.mode === 'live') setLiveExpiry(result.cooldownUntil);
      setText(''); setSuggestion(''); clearPhoto();
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
      setCaptchaToken(''); captchaRef.current?.reset();
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
                onChange={() => setErrors((old) => ({ ...old, name: '' }))} />
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
              <span className={`composer__counter${[...text].length >= 270 ? ' is-near' : ''}`} id="contact-counter">{[...text].length} / 300</span>
            </label>
            <textarea ref={textRef} className="textarea" id="contact-public-text" name="text" rows={3} required
              value={text} aria-invalid={Boolean(errors.text)} aria-describedby="contact-public-text-err contact-counter"
              onChange={(event) => { setText(event.target.value); setErrors((old) => ({ ...old, text: '' })); }}
              onKeyDown={(event) => { if (event.key === 'Escape') { setDismissed(suggestion); setSuggestion(''); } }}
              placeholder="Say hello or leave a note on the wall..." />
            <p className="error" id="contact-public-text-err" role="alert">{errors.text}</p>
          </div>
          <Honeypot />
          <div className="composer__country-section">
            <div className="country-line"><Globe className="icon" aria-hidden="true" />
              {backend?.countryAvailable === false ? 'Posting without country.' : backend?.mode === 'live' ? 'Country is determined by the contact service (approximate).'
                : country.name ? `${country.name} · ${countryChoice === 'auto' ? 'Estimated from browser timezone' : 'Selected manually'}` : 'Unspecified · Posting without country'}
            </div>
            {backend?.mode !== 'live' && <select className="country-select" aria-label="Country selection"
              value={countryChoice} onChange={(event) => setCountryChoice(event.target.value)}>
              <option value="auto">Auto-detect (approximate)</option>
              <option value="">Unspecified (no flag)</option>
              {countries.map((code) => <option key={code} value={code}>{names.of(code)}</option>)}
            </select>}
          </div>
          {suggestion && <div className="suggest" role="status">
            <span>✨ Did you mean:</span><strong>{suggestion}</strong>
            <button type="button" className="btn btn--ghost suggest__use-btn" onClick={() => { setText(suggestion); textRef.current?.focus(); }}>Use suggestion</button>
            <button type="button" className="x" aria-label="Dismiss suggestion" onClick={() => { setDismissed(suggestion); setSuggestion(''); textRef.current?.focus(); }}><X className="icon" aria-hidden="true" /></button>
          </div>}
          {backend?.requiresCaptcha && !unavailable && (turnstileSiteKey ? <Turnstile
            ref={captchaRef} siteKey={turnstileSiteKey} options={{ theme: 'dark', size: 'flexible' }}
            onSuccess={setCaptchaToken}
            onExpire={() => { setCaptchaToken(''); setStatus({ kind: 'warn', text: 'Verification expired. Please complete the security check again.' }); captchaRef.current?.reset(); }}
            onError={() => { setCaptchaToken(''); setStatus({ kind: 'err', text: 'Security verification could not load. Please try again later.' }); }}
            onUnsupported={() => { setCaptchaToken(''); setStatus({ kind: 'err', text: 'Security verification is unavailable in this browser.' }); }}
          /> : <p className="preview-count" role="alert">Security verification is not configured. Public submissions are unavailable.</p>)}
          {unavailable && <p className="preview-count" role="status">Public submissions are not enabled yet.</p>}
          <div className="composer__actions"><button className="btn" type="submit" disabled={submitDisabled}>
            <Send className="icon" aria-hidden="true" />{busy ? 'Posting…' : readingPhoto ? 'Reading photo…' : backend?.mode === 'preview' ? 'Preview Message' : 'Post Message'}
          </button></div>
        </div>
      </fieldset>
    </form>
    <Status status={status} />
  </article>;
}
