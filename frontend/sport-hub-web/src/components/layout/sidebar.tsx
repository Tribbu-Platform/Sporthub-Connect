'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { ComponentType } from 'react';

// ==========================================================================
// SidebarNav Types & Exports
// ==========================================================================

export interface SidebarNavItem {
  /** Etiqueta visible */
  label: string;
  /** Ruta de navegacion (Next.js) */
  href: string;
  /** Icono (componente React) */
  icon: ComponentType<{ className?: string }>;
  /** Si esta deshabilitado */
  disabled?: boolean;
}

export interface SidebarNavProps {
  /** Items de navegacion */
  items: SidebarNavItem[];
  /** Ruta actual para marcar el item activo */
  currentPath: string;
}

// ==========================================================================
// Sidebar Props
// ==========================================================================

export interface SidebarProps {
  /** Si la sidebar esta colapsada (mobile: controla el drawer) */
  collapsed: boolean;
  /** Callback para toggle de la sidebar */
  onToggle: () => void;
  /** Contenido de la sidebar (logo, navegacion, perfil) */
  children?: React.ReactNode;
}

// ==========================================================================
// SidebarNav Component
// ==========================================================================

export function SidebarNav({ items, currentPath }: SidebarNavProps) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4" data-testid="sidebar-nav">
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
          const Icon = item.icon;

          const linkContent = (
            <>
              <Icon className={cn(
                'h-5 w-5 flex-shrink-0',
                isActive ? 'text-[#00ff9d]' : 'text-[#b9cbbc]',
              )} />
              <span className={cn(
                'text-sm font-medium',
                isActive ? 'text-[#e2e2e6]' : 'text-[#b9cbbc]',
              )}>
                {item.label}
              </span>
            </>
          );

          const linkClasses = cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200',
            isActive && 'bg-[#00ff9d]/10 border-l-2 border-[#00ff9d]',
            !isActive && !item.disabled && 'hover:bg-[#1a1c1f] hover:text-[#e2e2e6]',
            item.disabled && 'opacity-40 cursor-not-allowed',
          );

          if (item.disabled) {
            return (
              <li key={item.href}>
                <span
                  className={linkClasses}
                  aria-disabled="true"
                  role="link"
                >
                  {linkContent}
                </span>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={linkClasses}
                aria-current={isActive ? 'page' : undefined}
              >
                {linkContent}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ==========================================================================
// Sidebar Component
// ==========================================================================

export function Sidebar({ collapsed, onToggle, children }: SidebarProps) {
  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'fixed top-4 left-4 z-[60] p-2 rounded-lg transition-colors duration-200 lg:hidden',
          'bg-[#1e2023] hover:bg-[#282a2d] text-[#e2e2e6]',
        )}
        aria-label={collapsed ? 'Abrir menu' : 'Cerrar menu'}
        aria-expanded={!collapsed}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          {collapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          )}
        </svg>
      </button>

      {/* Overlay backdrop for mobile */}
      {!collapsed && (
        <div
          data-testid="sidebar-overlay"
          className="fixed inset-0 z-[45] bg-black/50 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        role="navigation"
        aria-label="Sidebar"
        className={cn(
          'fixed top-0 left-0 z-50 flex flex-col h-screen bg-[#111317] shadow-level-1',
          'transition-transform duration-300 ease-in-out',
          // Desktop: always visible at 260px
          'lg:translate-x-0 lg:w-[260px]',
          // Mobile: translate based on collapsed state
          collapsed ? '-translate-x-full' : 'translate-x-0',
          'w-[260px]',
        )}
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Close button — visible only on mobile */}
        <div className="flex items-center justify-end p-3 lg:hidden">
          <button
            type="button"
            onClick={onToggle}
            className="p-2 rounded-lg text-[#b9cbbc] hover:text-[#e2e2e6] hover:bg-[#1a1c1f] transition-colors"
            aria-label="Cerrar sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {children}
      </aside>
    </>
  );
}
