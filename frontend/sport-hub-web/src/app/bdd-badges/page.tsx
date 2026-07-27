/**
 * BDD Test Page: Badges (US-005 / F024)
 *
 * Renders all Badge variants (roles + statuses) and sizes
 * so Playwright can verify computed styles in the BDD step definitions.
 *
 * This page is used exclusively by the BDD step definitions in
 * e2e/step_definitions/f024-us005-badges.steps.ts
 *
 * Route: /bdd-badges
 */
import { Badge } from '@/components/ui/badge';

export default function BadgeBDDPage() {
  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
        backgroundColor: '#0c0e11',
        color: '#e2e2e6',
      }}
      data-testid="bdd-badges-page"
    >
      {/* ── Role: Owner ── */}
      <section data-testid="section-roles">
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#e2e2e6' }}>
          Role Badges
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <Badge variant="owner" data-testid="badge-owner">Owner</Badge>
          <Badge variant="captain" data-testid="badge-captain">Captain</Badge>
          <Badge variant="coach" data-testid="badge-coach">Coach</Badge>
          <Badge variant="member" data-testid="badge-member">Member</Badge>
        </div>
      </section>

      {/* ── Status Badges ── */}
      <section data-testid="section-status">
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#e2e2e6' }}>
          Status Badges
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <Badge variant="success" data-testid="badge-success">Activo</Badge>
          <Badge variant="warning" data-testid="badge-warning">Pendiente</Badge>
          <Badge variant="error" data-testid="badge-error">Error</Badge>
          <Badge variant="info" data-testid="badge-info">Información</Badge>
        </div>
      </section>

      {/* ── Sizes ── */}
      <section data-testid="section-sizes">
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#e2e2e6' }}>
          Size Variants
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge variant="success" size="sm" data-testid="badge-size-sm">
            Pequeño
          </Badge>
          <Badge variant="success" size="default" data-testid="badge-size-default">
            Default
          </Badge>
          <Badge variant="success" size="lg" data-testid="badge-size-lg">
            Grande
          </Badge>
        </div>
      </section>
    </div>
  );
}
