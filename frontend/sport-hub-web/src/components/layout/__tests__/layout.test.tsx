/**
 * T008: Unit tests for MainContent and AppLayout components
 *
 * TDD: RED phase — all tests should FAIL because components don't exist yet.
 * After GREEN phase (creating components), all tests will PASS.
 *
 * Testing strategy:
 * - MainContent: renders children, padding responsive (32px desktop, 16px mobile)
 * - MainContent: gap 24px between children
 * - AppLayout: integrates Sidebar + MainContent correctly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainContent } from '../main-content';
import { AppLayout } from '../layout';

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
// Mock next/navigation for sidebar (AppLayout uses links)
// ---------------------------------------------------------------------------

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Mock IntersectionObserver (not available in jsdom)
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: () => [],
  })));
});

// ==========================================================================
// MainContent Component Tests
// ==========================================================================

describe('MainContent (T008)', () => {
  it('should render children content', () => {
    render(
      <MainContent>
        <div data-testid="page-content">Page Content</div>
      </MainContent>
    );

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('should have role="main" for accessibility', () => {
    render(
      <MainContent>
        <div>Content</div>
      </MainContent>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  describe('Desktop viewport (>= 1024px)', () => {
    beforeEach(() => {
      setViewportWidth(1440);
    });

    it('should apply 32px padding on desktop (via CSS class)', () => {
      render(
        <MainContent>
          <div>Content</div>
        </MainContent>
      );

      const main = screen.getByRole('main');
      expect(main.className).toContain('lg:p-[32px]');
    });

    it('should have margin-left matching sidebar width (via CSS class)', () => {
      render(
        <MainContent>
          <div>Content</div>
        </MainContent>
      );

      const main = screen.getByRole('main');
      expect(main.className).toContain('lg:ml-[260px]');
    });
  });

  describe('Mobile viewport (< 1024px)', () => {
    beforeEach(() => {
      setViewportWidth(375);
    });

    it('should apply 16px padding on mobile (via CSS class)', () => {
      render(
        <MainContent>
          <div>Content</div>
        </MainContent>
      );

      const main = screen.getByRole('main');
      expect(main.className).toContain('p-[16px]');
    });

    it('should have no margin-left on mobile (via CSS class)', () => {
      render(
        <MainContent>
          <div>Content</div>
        </MainContent>
      );

      const main = screen.getByRole('main');
      // Mobile: ml-0 means no margin-left. The lg breakpoint adds margin, but base is ml-0
      expect(main.className).toContain('ml-0');
    });
  });

  describe('Gutter between children', () => {
    it('should have 24px gap class for child elements', () => {
      render(
        <MainContent>
          <div data-testid="child-1">Module 1</div>
          <div data-testid="child-2">Module 2</div>
          <div data-testid="child-3">Module 3</div>
        </MainContent>
      );

      const main = screen.getByRole('main');
      expect(main.className).toContain('gap-[24px]');
    });
  });

  it('should accept className prop for custom styles', () => {
    render(
      <MainContent className="custom-class">
        <div>Content</div>
      </MainContent>
    );

    const main = screen.getByRole('main');
    expect(main.className).toContain('custom-class');
  });
});

// ==========================================================================
// AppLayout Component Tests
// ==========================================================================

describe('AppLayout (T008)', () => {
  beforeEach(() => {
    setViewportWidth(1440); // Desktop default
  });

  it('should render children inside the layout', () => {
    render(
      <AppLayout>
        <div data-testid="app-content">App Content Here</div>
      </AppLayout>
    );

    expect(screen.getByTestId('app-content')).toBeInTheDocument();
  });

  it('should render Sidebar component', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByRole('navigation', { name: /sidebar/i })).toBeInTheDocument();
  });

  it('should render MainContent component', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should render logo in the sidebar', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByText(/sport/i)).toBeInTheDocument();
  });

  it('should render navigation items in sidebar', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    // Default nav items should be present
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Comunidad')).toBeInTheDocument();
    expect(screen.getByText('Eventos')).toBeInTheDocument();
  });
});
