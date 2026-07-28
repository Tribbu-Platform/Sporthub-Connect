/**
 * BDD Test Page: Status Dot (US-007 / F024)
 *
 * Renders all StatusDot variants, sizes, and states so Playwright
 * can verify computed styles (background-color, box-shadow glow,
 * border-radius, diameter, tooltip, animation, accessibility).
 *
 * This page is used exclusively by the BDD step definitions in
 * e2e/step_definitions/f024-us007-status-dot.steps.ts
 *
 * Route: /bdd-status-dot
 */

import { StatusDot } from '@/components/ui/status-dot';

export default function StatusDotBDDPage() {
  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#111317',
        fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
      }}
      data-testid="bdd-status-dot-page"
    >
      {/* ── Variants ── */}
      <section data-testid="section-variants" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <StatusDot variant="active" />
        <StatusDot variant="pending" />
        <StatusDot variant="error" />
        <StatusDot variant="inactive" />
      </section>

      {/* ── Sizes ── */}
      <section data-testid="section-sizes" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <StatusDot variant="active" size="sm" />
        <StatusDot variant="active" size="default" />
        <StatusDot variant="active" size="lg" />
      </section>

      {/* ── Tooltip ── */}
      <section data-testid="section-tooltip" style={{ marginBottom: '24px' }}>
        <StatusDot variant="active" tooltip="En linea" />
      </section>

      {/* ── Pulsing ── */}
      <section data-testid="section-pulsing" style={{ marginBottom: '24px' }}>
        <StatusDot variant="active" pulsing={true} />
      </section>

      {/* ── Accessibility ── */}
      <section data-testid="section-accessibility" style={{ marginBottom: '24px' }}>
        <StatusDot variant="active" />
        <StatusDot variant="inactive" aria-label="Estado desconocido" />
      </section>
    </div>
  );
}
