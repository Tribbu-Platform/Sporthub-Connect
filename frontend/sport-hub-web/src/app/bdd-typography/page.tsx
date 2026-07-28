/**
 * BDD Test Page: Typography (US-009 / F024)
 *
 * Renders elements with all typography utility classes so Playwright
 * can verify computed styles (font-size, font-weight, line-height,
 * letter-spacing, text-transform, font-family, and responsive scaling).
 *
 * This page is used exclusively by the BDD step definitions in
 * e2e/step_definitions/f024-us009-typography.steps.ts
 *
 * Route: /__bdd__/typography
 */

export default function TypographyBDDPage() {
  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
      }}
      data-testid="bdd-typography-page"
    >
      {/* ── Display Large ── */}
      <section data-testid="section-display-lg">
        <h1 className="text-display-lg" data-testid="el-display-lg">
          Titulo Principal Display
        </h1>
      </section>

      {/* ── Headline Medium ── */}
      <section data-testid="section-headline-md">
        <h2 className="text-headline-md" data-testid="el-headline-md">
          Subtitulo Headline Medium
        </h2>
      </section>

      {/* ── Headline Small ── */}
      <section data-testid="section-headline-sm">
        <h3 className="text-headline-sm" data-testid="el-headline-sm">
          Seccion Headline Small
        </h3>
      </section>

      {/* ── Body Large ── */}
      <section data-testid="section-body-lg">
        <p className="text-body-lg" data-testid="el-body-lg">
          Parrafo de cuerpo grande con texto extendido para verificar el
          line-height y espaciado en textos largos que ocupan multiples lineas.
        </p>
      </section>

      {/* ── Body Medium ── */}
      <section data-testid="section-body-md">
        <p className="text-body-md" data-testid="el-body-md">
          Texto estandar de cuerpo medio usado en la mayoria de componentes y
          descripciones dentro de la aplicacion.
        </p>
      </section>

      {/* ── Label Caps ── */}
      <section data-testid="section-label-caps">
        <span className="text-label-caps" data-testid="el-label-caps">
          Categoria Etiqueta
        </span>
      </section>

      {/* ── Meta Small ── */}
      <section data-testid="section-meta-sm">
        <span className="text-meta-sm" data-testid="el-meta-sm">
          hace 5 minutos
        </span>
      </section>

      {/* ── Metric (bold numeric data) ── */}
      <section data-testid="section-metric">
        <span className="text-metric" data-testid="el-metric">
          1,250 XP
        </span>
      </section>
    </div>
  );
}
