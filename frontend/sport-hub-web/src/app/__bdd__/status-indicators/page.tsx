/**
 * BDD Test Page: Status Indicators (US-007 / F024)
 *
 * Renders all StatusDot variants, sizes, tooltip, and pulsing states
 * so Playwright can verify computed styles (background-color, box-shadow,
 * width, height, border-radius).
 *
 * This page is used exclusively by the BDD step definitions in
 * e2e/step_definitions/f024-us007-status-indicators.steps.ts
 *
 * Route: /__bdd__/status-indicators
 */

import { StatusDot } from '@/components/ui/status-dot';

export default function StatusIndicatorsBDDPage() {
  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#111317',
        color: '#e2e2e6',
        fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
      }}
      data-testid="bdd-status-indicators-page"
    >
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>
        Status Indicators — BDD Test Page
      </h1>

      {/* ── Variants (default 8px) ── */}
      <section data-testid="section-variants" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Color Variants (default 8px)</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span data-testid="dot-active"><StatusDot variant="active" /></span>
            <span>Active</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span data-testid="dot-pending"><StatusDot variant="pending" /></span>
            <span>Pending</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span data-testid="dot-error"><StatusDot variant="error" /></span>
            <span>Error</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span data-testid="dot-inactive"><StatusDot variant="inactive" /></span>
            <span>Inactive</span>
          </div>
        </div>
      </section>

      {/* ── Sizes ── */}
      <section data-testid="section-sizes" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Sizes (active variant)</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span data-testid="dot-size-sm"><StatusDot variant="active" size="sm" /></span>
            <span>sm (6px)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span data-testid="dot-size-default"><StatusDot variant="active" /></span>
            <span>default (8px)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span data-testid="dot-size-lg"><StatusDot variant="active" size="lg" /></span>
            <span>lg (12px)</span>
          </div>
        </div>
      </section>

      {/* ── Tooltip ── */}
      <section data-testid="section-tooltip" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Tooltip</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span data-testid="dot-tooltip"><StatusDot variant="active" tooltip="En linea" /></span>
            <span>With tooltip</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span data-testid="dot-tooltip-pending"><StatusDot variant="pending" tooltip="Verificando..." /></span>
            <span>Pending tooltip</span>
          </div>
        </div>
      </section>

      {/* ── Pulsing ── */}
      <section data-testid="section-pulsing" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Pulsing Animation</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span data-testid="dot-pulsing"><StatusDot variant="active" pulsing /></span>
            <span>Pulsing active</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span data-testid="dot-pulsing-error"><StatusDot variant="error" pulsing /></span>
            <span>Pulsing error</span>
          </div>
        </div>
      </section>

      {/* ── All props combined ── */}
      <section data-testid="section-combined" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>All Props Combined</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span data-testid="dot-combined">
            <StatusDot
              variant="error"
              size="lg"
              tooltip="Error critico"
              pulsing
            />
          </span>
          <span>Error lg + tooltip + pulsing</span>
        </div>
      </section>

      {/* ── Accessibility: no tooltip (uses default aria-label) ── */}
      <section data-testid="section-accessibility">
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Accessibility (no tooltip)</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span data-testid="dot-a11y-active"><StatusDot variant="active" /></span>
          <span data-testid="dot-a11y-inactive"><StatusDot variant="inactive" /></span>
        </div>
      </section>
    </div>
  );
}
