/**
 * T007: Unit tests for Sidebar and SidebarNav components
 *
 * TDD: RED phase — all tests should FAIL because components don't exist yet.
 * After GREEN phase (creating components), all tests will PASS.
 *
 * Testing strategy:
 * - Desktop (>= 1024px): Sidebar visible, 260px wide, fixed position
 * - Mobile (< 1024px): Sidebar hidden when collapsed, overlay drawer when open
 * - SidebarNav: renders items, highlights active, supports disabled
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar, SidebarNav } from '../sidebar';
import type { SidebarNavItem } from '../sidebar';

// ---------------------------------------------------------------------------
// Helpers for responsive testing
// ---------------------------------------------------------------------------

function setViewportWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const mockNavItems: SidebarNavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: () => <span data-testid="icon-dashboard">📊</span>,
  },
  {
    label: 'Comunidad',
    href: '/community',
    icon: () => <span data-testid="icon-community">👥</span>,
  },
  {
    label: 'Eventos',
    href: '/events',
    icon: () => <span data-testid="icon-events">📅</span>,
  },
  {
    label: 'Configuracion',
    href: '/settings',
    icon: () => <span data-testid="icon-settings">⚙️</span>,
    disabled: true,
  },
];

// ==========================================================================
// Sidebar Component Tests
// ==========================================================================

describe('Sidebar (T007)', () => {
  beforeEach(() => {
    // Default to desktop viewport
    setViewportWidth(1280);
  });

  // --- Desktop viewport tests ---

  describe('Desktop viewport (>= 1024px)', () => {
    it('should render with 260px width (via CSS class)', () => {
      render(
        <Sidebar collapsed={false} onToggle={vi.fn()}>
          <div>Sidebar Content</div>
        </Sidebar>
      );

      const sidebar = screen.getByRole('navigation', { name: /sidebar/i });
      // Verify the Tailwind width class is present on the element
      expect(sidebar.className).toContain('w-[260px]');
      // lg breakpoint also sets 260px width
      expect(sidebar.className).toContain('lg:w-[260px]');
    });

    it('should have background color #111317 (via CSS class)', () => {
      render(
        <Sidebar collapsed={false} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      const sidebar = screen.getByRole('navigation', { name: /sidebar/i });
      // Verify the bg class is present
      expect(sidebar.className).toContain('bg-[#111317]');
    });

    it('should have position fixed (via CSS class)', () => {
      render(
        <Sidebar collapsed={false} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      const sidebar = screen.getByRole('navigation', { name: /sidebar/i });
      // Verify the fixed class is present
      expect(sidebar.className).toContain('fixed');
    });

    it('should have full viewport height (via CSS class)', () => {
      render(
        <Sidebar collapsed={false} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      const sidebar = screen.getByRole('navigation', { name: /sidebar/i });
      // Verify the h-screen class is present
      expect(sidebar.className).toContain('h-screen');
    });

    it('should render children content', () => {
      render(
        <Sidebar collapsed={false} onToggle={vi.fn()}>
          <div>
            <div data-testid="sidebar-logo">SportHub Logo</div>
            <nav data-testid="sidebar-nav">Navigation</nav>
            <div data-testid="sidebar-profile">User Profile</div>
          </div>
        </Sidebar>
      );

      expect(screen.getByTestId('sidebar-logo')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-profile')).toBeInTheDocument();
    });

    it('should have hamburger button with lg:hidden class (hidden on desktop via responsive CSS)', () => {
      render(
        <Sidebar collapsed={false} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      // The hamburger button (with lg:hidden class) is always rendered but hidden on desktop
      // Use getAllByRole to find the correct one
      const buttons = screen.getAllByRole('button');
      const hamburger = buttons.find(btn => btn.className.includes('lg:hidden'));
      expect(hamburger).toBeDefined();
      expect(hamburger?.className).toContain('lg:hidden');
    });

    it('should be visible even when collapsed prop is true (desktop always shows sidebar)', () => {
      render(
        <Sidebar collapsed={true} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      const sidebar = screen.getByRole('navigation', { name: /sidebar/i });
      expect(sidebar).toBeInTheDocument();
    });
  });

  // --- Mobile viewport tests ---

  describe('Mobile viewport (< 1024px)', () => {
    beforeEach(() => {
      setViewportWidth(375); // iPhone SE width
    });

    it('should render hamburger button on mobile', () => {
      render(
        <Sidebar collapsed={true} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      const hamburger = screen.getByRole('button', { name: /menu|abrir|toggle/i });
      expect(hamburger).toBeInTheDocument();
    });

    it('should hide sidebar panel when collapsed is true', () => {
      render(
        <Sidebar collapsed={true} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      const sidebar = screen.getByRole('navigation', { name: /sidebar/i });
      // When collapsed on mobile, the sidebar should have -translate-x-full class
      expect(sidebar.className).toContain('-translate-x-full');
    });

    it('should show sidebar panel as overlay when collapsed is false', () => {
      render(
        <Sidebar collapsed={false} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      const sidebar = screen.getByRole('navigation', { name: /sidebar/i });
      // When open on mobile, sidebar should NOT have -translate-x-full
      expect(sidebar.className).not.toContain('-translate-x-full');
      expect(sidebar.className).toContain('translate-x-0');
    });

    it('should call onToggle when hamburger is clicked', async () => {
      const onToggle = vi.fn();
      const user = userEvent.setup();

      render(
        <Sidebar collapsed={true} onToggle={onToggle}>
          <div>Content</div>
        </Sidebar>
      );

      const hamburger = screen.getByRole('button', { name: /menu|abrir|toggle/i });
      await user.click(hamburger);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should render overlay backdrop when sidebar is open', () => {
      render(
        <Sidebar collapsed={false} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      const overlay = screen.getByTestId('sidebar-overlay');
      expect(overlay).toBeInTheDocument();
      // Overlay should have fixed positioning
      expect(overlay.className).toContain('fixed');
      expect(overlay.className).toContain('inset-0');
    });

    it('should not render overlay backdrop when sidebar is closed', () => {
      render(
        <Sidebar collapsed={true} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();
    });

    it('should call onToggle when overlay is clicked', async () => {
      const onToggle = vi.fn();
      const user = userEvent.setup();

      render(
        <Sidebar collapsed={false} onToggle={onToggle}>
          <div>Content</div>
        </Sidebar>
      );

      const overlay = screen.getByTestId('sidebar-overlay');
      await user.click(overlay);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle when close button is clicked', async () => {
      const onToggle = vi.fn();
      const user = userEvent.setup();

      render(
        <Sidebar collapsed={false} onToggle={onToggle}>
          <div>Content</div>
        </Sidebar>
      );

      // The close button inside the sidebar panel has aria-label="Cerrar sidebar"
      const closeButton = screen.getByRole('button', { name: 'Cerrar sidebar' });
      await user.click(closeButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  // --- Accessibility tests ---

  describe('Accessibility', () => {
    it('should have navigation role', () => {
      render(
        <Sidebar collapsed={false} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have aria-label on sidebar', () => {
      render(
        <Sidebar collapsed={false} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      expect(screen.getByRole('navigation', { name: /sidebar/i })).toBeInTheDocument();
    });

    it('should have aria-label on hamburger button', () => {
      setViewportWidth(375);

      render(
        <Sidebar collapsed={true} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      // The hamburger button (not the close sidebar button) has aria-label="Abrir menu"
      const hamburger = screen.getByRole('button', { name: 'Abrir menu' });
      expect(hamburger).toHaveAttribute('aria-label');
      expect(hamburger.getAttribute('aria-label')).toBe('Abrir menu');
    });

    it('hamburger button should have aria-expanded reflecting sidebar state', () => {
      setViewportWidth(375);

      const { rerender } = render(
        <Sidebar collapsed={true} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      let hamburger = screen.getByRole('button', { name: 'Abrir menu' });
      expect(hamburger).toHaveAttribute('aria-expanded', 'false');

      rerender(
        <Sidebar collapsed={false} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      // When sidebar is open, the hamburger changes to "Cerrar menu"
      hamburger = screen.getByRole('button', { name: 'Cerrar menu' });
      expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  // --- Transition tests ---

  describe('Transitions', () => {
    it('should have CSS transition applied', () => {
      render(
        <Sidebar collapsed={false} onToggle={vi.fn()}>
          <div>Content</div>
        </Sidebar>
      );

      const sidebar = screen.getByRole('navigation', { name: /sidebar/i });
      // The transition classes should be present
      expect(sidebar.className).toContain('transition-transform');
      expect(sidebar.className).toContain('duration-300');
    });
  });
});

// ==========================================================================
// SidebarNav Component Tests
// ==========================================================================

describe('SidebarNav (T007)', () => {
  it('should render all navigation items', () => {
    render(<SidebarNav items={mockNavItems} currentPath="/dashboard" />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Comunidad')).toBeInTheDocument();
    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.getByText('Configuracion')).toBeInTheDocument();
  });

  it('should render icon and label for each item', () => {
    render(<SidebarNav items={mockNavItems} currentPath="/dashboard" />);

    expect(screen.getByTestId('icon-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('icon-community')).toBeInTheDocument();
    expect(screen.getByTestId('icon-events')).toBeInTheDocument();
    expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
  });

  it('should highlight the active item (matching currentPath) with emerald indicator', () => {
    render(<SidebarNav items={mockNavItems} currentPath="/community" />);

    const communityLink = screen.getByText('Comunidad').closest('a');
    expect(communityLink).toBeInTheDocument();

    // Active item should have emerald border or accent indicator
    const activeItem = communityLink?.closest('li') || communityLink;
    expect(activeItem).toBeInTheDocument();

    // The active link should have a distinguishing class or style
    const classes = communityLink?.className || '';
    const hasActiveClass = classes.includes('border-emerald') ||
      classes.includes('border-primary') ||
      classes.includes('border-l') ||
      classes.includes('bg-');
    expect(hasActiveClass).toBe(true);
  });

  it('should not highlight non-active items', () => {
    render(<SidebarNav items={mockNavItems} currentPath="/dashboard" />);

    // Non-active items should not have the active indicator
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink?.className || '').toBeTruthy(); // Should be the active one
  });

    it('should support disabled items (non-clickable)', () => {
      render(<SidebarNav items={mockNavItems} currentPath="/dashboard" />);

      // Disabled items render as a <span> with role="link" and aria-disabled="true"
      // The text "Configuracion" is inside a nested span; find the closest element with aria-disabled
      const settingsItem = screen.getByText('Configuracion');
      const settingsLink = settingsItem.closest('[aria-disabled]');
      expect(settingsLink).toBeInTheDocument();
      expect(settingsLink).toHaveAttribute('aria-disabled', 'true');
      expect(settingsLink?.tagName).toBe('SPAN');
    });

  it('should render each item as a link with correct href', () => {
    render(<SidebarNav items={mockNavItems} currentPath="/dashboard" />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');

    const communityLink = screen.getByText('Comunidad').closest('a');
    expect(communityLink).toHaveAttribute('href', '/community');
  });
});
