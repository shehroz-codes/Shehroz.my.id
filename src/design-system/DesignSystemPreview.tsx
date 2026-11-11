import { useState } from 'react'

const colors = [
  { label: 'Background', token: '--color-background', className: 'bg-background' },
  { label: 'Surface', token: '--color-surface', className: 'bg-surface' },
  { label: 'Primary', token: '--color-primary', className: 'bg-primary' },
  { label: 'Secondary', token: '--color-secondary', className: 'bg-secondary' },
  { label: 'Text', token: '--color-text', className: 'bg-text' },
  { label: 'Muted', token: '--color-muted', className: 'bg-muted' },
  { label: 'Accent', token: '--color-accent', className: 'bg-accent' },
]

/** Temporary token specimen. Replace only when portfolio work is approved. */
export function DesignSystemPreview() {
  const [message, setMessage] = useState('Tab through the buttons to inspect keyboard focus.')

  return (
    <main className="min-h-screen bg-[image:var(--gradient-ambient)] px-page py-section">
      <div className="mx-auto max-w-preview space-y-8">
        <header className="space-y-4">
          <p className="font-mono text-label text-accent">PHASE 02 / FOUNDATION</p>
          <h1 className="text-display">Design system preview</h1>
          <p className="max-w-2xl text-muted">A temporary reference for typography, color, and interaction. No portfolio content is included.</p>
        </header>

        <section aria-labelledby="typography-title" className="ds-panel space-y-6">
          <h2 id="typography-title" className="text-title">Typography</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-label text-muted">Space Grotesk / headings</p>
              <p className="font-heading text-title font-semibold">Clarity in every detail.</p>
            </div>
            <div className="space-y-3">
              <p className="text-label text-muted">Inter / body</p>
              <p className="text-body">Readable text, generous spacing, and a focused dark palette.</p>
              <code className="block break-words text-label text-accent">JetBrains Mono / const theme = 'dark';</code>
            </div>
          </div>
        </section>

        <section aria-labelledby="colors-title" className="ds-panel space-y-6">
          <h2 id="colors-title" className="text-title">Color palette</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colors.map((color) => (
              <li key={color.token} className="min-w-0 space-y-2">
                <div aria-hidden="true" className={`h-20 rounded-control border border-accent/40 ${color.className}`} />
                <p className="font-medium">{color.label}</p>
                <code className="block break-all text-xs text-muted">{color.token}</code>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="buttons-title" className="ds-panel space-y-6">
          <h2 id="buttons-title" className="text-title">Buttons & focus</h2>
          <div className="flex flex-wrap gap-4">
            <button type="button" className="ds-button ds-button-primary" onClick={() => setMessage('Primary button activated.')}>Primary button</button>
            <button type="button" className="ds-button" onClick={() => setMessage('Secondary button activated.')}>Secondary button</button>
            <button type="button" className="ds-button" disabled>Disabled button</button>
          </div>
          <p role="status" className="text-label text-muted">{message}</p>
        </section>
      </div>
    </main>
  )
}
