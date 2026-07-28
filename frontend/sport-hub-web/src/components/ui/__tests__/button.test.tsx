import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

// ============================================================================
// T001/T005 — Variante primary: renderizado
// ============================================================================
describe("Button — variant primary", () => {
  it("Should_RenderPrimaryButton_When_VariantIsPrimary", () => {
    // T001: primary variant rendering with class-based assertions
    render(<Button variant="primary">Guardar</Button>);

    const btn = screen.getByRole("button", { name: /guardar/i });

    // Content
    expect(btn).toHaveTextContent("Guardar");

    // Background-color: uses design token class
    expect(btn.className).toMatch(/bg-primary-container/);

    // Text color: uses on-primary-container class
    expect(btn.className).toMatch(/text-on-primary-container/);

    // Font weight bold (700) — class-based
    expect(btn.className).toMatch(/font-bold/);

    // No border — primary has border-0
    expect(btn.className).toMatch(/border-0/);

    // Border radius via rounded-md
    expect(btn.className).toMatch(/rounded-md/);
  });

  it("Should_ShowHoverGlow_When_PrimaryButtonHasHoverClass", () => {
    // T004: hover state — the component must include a hover:shadow class
    render(<Button variant="primary">Guardar</Button>);
    const btn = screen.getByRole("button", { name: /guardar/i });

    // Assert the class list includes a hover shadow utility
    const classes = btn.className;
    expect(classes).toMatch(/hover:shadow/);
  });

  it("Should_ShowFocusState_When_Focused", async () => {
    // T004: focus-visible state
    const user = userEvent.setup();
    render(<Button variant="primary">Guardar</Button>);
    const btn = screen.getByRole("button", { name: /guardar/i });

    // Focus the button via keyboard
    await user.tab();
    expect(btn).toHaveFocus();

    // The component should have focus-visible ring classes
    const classes = btn.className;
    expect(classes).toMatch(/focus-visible:ring/);
  });

  it("Should_HaveActiveScale_When_ActiveClassPresent", () => {
    // T004: active state — scale 0.98
    render(<Button variant="primary">Guardar</Button>);
    const btn = screen.getByRole("button", { name: /guardar/i });

    const classes = btn.className;
    expect(classes).toMatch(/active:scale/);
  });

  it("Should_RenderDisabledState_When_Disabled", () => {
    // T004: disabled state
    render(
      <Button variant="primary" disabled>
        Guardar
      </Button>
    );
    const btn = screen.getByRole("button", { name: /guardar/i });

    // Disabled attribute
    expect(btn).toBeDisabled();

    // Opacity 40% — class-based
    expect(btn.className).toMatch(/disabled:opacity-40/);

    // Cursor not-allowed — class-based
    expect(btn.className).toMatch(/disabled:cursor-not-allowed/);
  });

  it("Should_NotFireClick_When_Disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button variant="primary" disabled onClick={onClick}>
        Guardar
      </Button>
    );
    const btn = screen.getByRole("button", { name: /guardar/i });

    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});

// ============================================================================
// T002/T006 — Variantes secondary, ghost
// ============================================================================
describe("Button — variant secondary", () => {
  it("Should_RenderSecondaryButton_When_VariantIsSecondary", () => {
    // T002: secondary variant rendering — class-based assertions
    render(<Button variant="secondary">Cancelar</Button>);
    const btn = screen.getByRole("button", { name: /cancelar/i });

    // Transparent background
    expect(btn.className).toMatch(/bg-transparent/);

    // Emerald text (#00ff9d)
    expect(btn.className).toMatch(/text-primary-container/);

    // Has border with emerald color
    expect(btn.className).toMatch(/border-primary-container/);
  });

  it("Should_HaveHoverClass_ForSecondary", () => {
    render(<Button variant="secondary">Cancelar</Button>);
    const btn = screen.getByRole("button", { name: /cancelar/i });

    const classes = btn.className;
    // Should have a hover class that applies emerald tint
    expect(classes).toMatch(/hover:bg-primary-container/);
  });
});

describe("Button — variant ghost", () => {
  it("Should_RenderGhostVariant_When_VariantIsGhost", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button", { name: /ghost/i });

    // Same visual characteristics as secondary: transparent bg, emerald border
    expect(btn.className).toMatch(/bg-transparent/);
    expect(btn.className).toMatch(/border-primary-container/);
  });
});

// ============================================================================
// T003/T006 — Variante icon
// ============================================================================
describe("Button — variant icon", () => {
  it("Should_RenderIconButton_When_VariantIsIcon", () => {
    // T003: icon variant rendering — class-based assertions
    render(
      <Button variant="icon" size="icon" aria-label="Configuracion">
        <span data-testid="icon">⚙</span>
      </Button>
    );
    const btn = screen.getByRole("button", { name: /configuracion/i });

    // Circular: rounded-full
    expect(btn.className).toMatch(/rounded-full/);

    // Transparent background
    expect(btn.className).toMatch(/bg-transparent/);

    // Contains the icon child
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("Should_HaveHoverClass_ForIcon", () => {
    render(
      <Button variant="icon" size="icon" aria-label="Configuracion">
        ⚙
      </Button>
    );
    const btn = screen.getByRole("button", { name: /configuracion/i });

    const classes = btn.className;
    // Should have hover class for emerald tint at 15%
    expect(classes).toMatch(/hover:bg-primary-container/);
  });

  it("Should_BeSquare_When_SizeIsIcon", () => {
    render(
      <Button variant="icon" size="icon" aria-label="Configuracion">
        ⚙
      </Button>
    );
    const btn = screen.getByRole("button", { name: /configuracion/i });

    // Icon size variant applies w-10 h-10 (square)
    const classes = btn.className;
    expect(classes).toMatch(/w-10/);
    expect(classes).toMatch(/h-10/);
  });
});

// ============================================================================
// T006 — Sizes
// ============================================================================
describe("Button — sizes", () => {
  it("Should_RenderSmallSize_When_SizeIsSm", () => {
    render(
      <Button variant="primary" size="sm">
        Pequeno
      </Button>
    );
    const btn = screen.getByRole("button", { name: /pequeno/i });
    const classes = btn.className;
    expect(classes).toMatch(/h-8/);
  });

  it("Should_RenderDefaultSize_When_SizeNotSpecified", () => {
    render(<Button variant="primary">Default</Button>);
    const btn = screen.getByRole("button", { name: /default/i });
    const classes = btn.className;
    expect(classes).toMatch(/h-10/);
  });

  it("Should_RenderLargeSize_When_SizeIsLg", () => {
    render(
      <Button variant="primary" size="lg">
        Grande
      </Button>
    );
    const btn = screen.getByRole("button", { name: /grande/i });
    const classes = btn.className;
    expect(classes).toMatch(/h-12/);
  });
});

// ============================================================================
// T007 — Accessibility
// ============================================================================
describe("Button — accessibility", () => {
  it("Should_HaveButtonRole_When_Rendered", () => {
    render(<Button variant="primary">Accesible</Button>);
    const btn = screen.getByRole("button", { name: /accesible/i });
    expect(btn).toBeInTheDocument();
  });

  it("Should_HaveAriaDisabled_When_Disabled", () => {
    render(
      <Button variant="primary" disabled>
        Disabled
      </Button>
    );
    const btn = screen.getByRole("button", { name: /disabled/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("disabled");
  });

  it("Should_BeFocusableViaTab_When_Enabled", async () => {
    const user = userEvent.setup();
    render(<Button variant="primary">Tab me</Button>);
    const btn = screen.getByRole("button", { name: /tab me/i });

    // Initially not focused
    expect(document.body).toHaveFocus();

    await user.tab();
    expect(btn).toHaveFocus();
  });

  it("Should_AcceptAriaLabel_When_IconButton", () => {
    render(
      <Button variant="icon" size="icon" aria-label="Configuracion">
        ⚙
      </Button>
    );
    const btn = screen.getByRole("button", { name: /configuracion/i });
    expect(btn).toHaveAttribute("aria-label", "Configuracion");
  });

  it("Should_SupportAsChild_ForRadixCompatibility", () => {
    // asChild prop should be accepted and forwarded
    render(
      <Button variant="primary" asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    // When asChild is used, the underlying element should be an anchor
    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });
});

// ============================================================================
// Gherkin scenarios correspondences
// ============================================================================
describe("Button — Gherkin scenario checks", () => {
  it("Should_RenderDefaultVariant_When_NoVariantIsSpecified", () => {
    // Default variant is "primary" — class-based assertion
    render(<Button>Default</Button>);
    const btn = screen.getByRole("button", { name: /default/i });
    // Should use primary-container background class
    expect(btn.className).toMatch(/bg-primary-container/);
  });

  it("Should_AcceptCustomClassName_When_Provided", () => {
    render(
      <Button variant="primary" className="custom-class">
        Custom
      </Button>
    );
    const btn = screen.getByRole("button", { name: /custom/i });
    expect(btn.className).toContain("custom-class");
  });

  it("Should_KeepBaseStyles_When_CustomClassIsProvided", () => {
    render(
      <Button variant="primary" className="custom">
        Base
      </Button>
    );
    const btn = screen.getByRole("button", { name: /base/i });
    const classes = btn.className;
    expect(classes).toMatch(/inline-flex/);
    expect(classes).toContain("custom");
  });

  it("Should_FireEvent_When_Clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button variant="primary" onClick={onClick}>
        Click
      </Button>
    );
    const btn = screen.getByRole("button", { name: /click/i });

    await user.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("Should_RenderAsButtonElement_ByDefault", () => {
    render(<Button variant="primary">Element</Button>);
    const btn = screen.getByRole("button", { name: /element/i });
    expect(btn.tagName).toBe("BUTTON");
  });
});
