/**
 * BDD Test Page: Cards y Glassmorphism (US-004 / F024)
 *
 * Renders all Card elevation levels (0-3), cards with headers,
 * gradient headers, composite cards with buttons/badges,
 * and fallback scenarios. Each element has a data-testid
 * so Playwright can find and inspect it.
 *
 * Route: /bdd-cards
 */
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CardsBDDPage() {
  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
        backgroundColor: '#0c0e11',
        color: '#e2e2e6',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
      data-testid="bdd-cards-page"
    >
      <h1
        style={{ fontSize: '24px', fontWeight: 700, color: '#e2e2e6' }}
      >
        BDD: Cards &amp; Glassmorphism (US-004)
      </h1>

      {/* ═══════════════════════════════════════════════════════════
          Scenario 1: Default card (Level 2 glassmorphism)
          ═══════════════════════════════════════════════════════════ */}
      <section data-testid="section-default-card">
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Default Card (Level 2)</h2>
        <Card data-testid="card-default">
          <CardContent>Contenido Default</CardContent>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          Scenario 2: Level 0 elevation (base canvas)
          ═══════════════════════════════════════════════════════════ */}
      <section data-testid="section-level-0">
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Level 0 — Base Canvas</h2>
        <Card elevation={0} data-testid="card-level-0">
          <CardContent>Base Canvas</CardContent>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          Scenario 3: Level 1 elevation (sidebar/navigation)
          ═══════════════════════════════════════════════════════════ */}
      <section data-testid="section-level-1">
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Level 1 — Sidebar</h2>
        <Card elevation={1} data-testid="card-level-1">
          <CardContent>Sidebar Content</CardContent>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          Scenario 4: Level 2 elevation (standard glassmorphism)
          ═══════════════════════════════════════════════════════════ */}
      <section data-testid="section-level-2">
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Level 2 — Glassmorphism Standard</h2>
        <Card elevation={2} data-testid="card-level-2">
          <CardContent>Dashboard Card</CardContent>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          Scenario 5: Level 3 elevation (modal/popover)
          ═══════════════════════════════════════════════════════════ */}
      <section data-testid="section-level-3">
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Level 3 — Modal / Popover</h2>
        <Card elevation={3} data-testid="card-level-3">
          <CardContent>Modal Content</CardContent>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          Scenario 6: Card with header (title + description)
          ═══════════════════════════════════════════════════════════ */}
      <section data-testid="section-card-with-header">
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Card with Header</h2>
        <Card elevation={2} data-testid="card-with-header">
          <CardHeader data-testid="card-header-block">
            <CardTitle data-testid="card-title">Titulo de Seccion</CardTitle>
            <CardDescription>Descripcion secundaria</CardDescription>
          </CardHeader>
          <CardContent data-testid="card-content-block">Contenido principal</CardContent>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          Scenario 7: Card with gradient header
          ═══════════════════════════════════════════════════════════ */}
      <section data-testid="section-gradient-header">
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Card with Gradient Header</h2>
        <Card elevation={2} data-testid="card-gradient-header">
          <CardHeader
            className="card-header-gradient"
            style={{
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
            }}
            data-testid="card-gradient-header-block"
          >
            <CardTitle>Titulo con Gradiente</CardTitle>
          </CardHeader>
          <CardContent>Contenido debajo del gradiente</CardContent>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          Scenario 8: Fallback solid background
          ═══════════════════════════════════════════════════════════ */}
      <section data-testid="section-fallback">
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Fallback Content (glass-2 class)</h2>
        <Card elevation={2} data-testid="card-fallback">
          <CardContent>Fallback Content — Legible</CardContent>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          Scenario 9: Composability (Card + Button + Badge)
          ═══════════════════════════════════════════════════════════ */}
      <section data-testid="section-composite">
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Composite Card</h2>
        <Card elevation={2} data-testid="card-composite">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Button variant="primary" data-testid="composite-edit-button">
                Editar
              </Button>
              <Badge variant="success" data-testid="composite-badge">
                Activo
              </Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" data-testid="composite-cancel-button">
              Cancelar
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
