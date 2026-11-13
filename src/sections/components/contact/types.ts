export interface Country { code: string | null; name: string | null }
export interface WallMessage {
  id: string;
  name: string;
  text: string;
  photoUrl: string | null;
  countryCode: string | null;
  countryName: string | null;
  createdAt: number;
  isDemo: boolean;
}
export interface PublicSubmission {
  turnstileToken?: string;
  name: string;
  text: string;
  photo: File | null;
  photoDataUrl: string | null;
  country: Country;
  honeypot: string;
}
export interface PrivateSubmission {
  turnstileToken?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot: string;
}
export interface Feed { messages: WallMessage[]; hasMore: boolean }
export interface Backend {
  mode: 'preview' | 'live';
  requiresCaptcha?: boolean;
  submissionsEnabled?: boolean;
  photosEnabled?: boolean;
  countryAvailable?: boolean;
  prepareSession?(captchaToken: string): Promise<boolean>;
  subscribe(limit: number, update: (feed: Feed) => void, error: (message: string) => void): () => void;
  submitPublic(input: PublicSubmission): Promise<{ status: 'published' | 'pending'; cooldownUntil: number }>;
  submitPrivate(input: PrivateSubmission): Promise<void>;
  detectCountry(): Promise<Country>;
}
export class ContactError extends Error {
  constructor(message: string, public cooldownUntil?: number) { super(message); }
}
