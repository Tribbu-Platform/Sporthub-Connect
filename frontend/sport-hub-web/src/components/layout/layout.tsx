'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, SidebarNav } from './sidebar';
import { MainContent } from './main-content';
import type { SidebarNavItem } from './sidebar';

// ==========================================================================
// AppLayout Props
// ==========================================================================

export interface AppLayoutProps {
  children: React.ReactNode;
}

// ==========================================================================
// Default Navigation Items
// ==========================================================================

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function CommunityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function EventsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function RankingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

const defaultNavItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { label: 'Comunidad', href: '/community', icon: CommunityIcon },
  { label: 'Eventos', href: '/events', icon: EventsIcon },
  { label: 'Rankings', href: '/rankings', icon: RankingsIcon },
];

// ==========================================================================
// Logo Component
// ==========================================================================

function AppLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 px-4 py-5 border-b border-[#1a1c1f] hover:no-underline"
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#00ff9d] text-[#00391f] text-lg font-bold">
        SH
      </span>
      <div className="flex flex-col">
        <span className="text-base font-bold text-[#e2e2e6] leading-tight">
          SportHub
        </span>
        <span className="text-[11px] text-[#b9cbbc] font-medium uppercase tracking-[0.1em]">
          Connect
        </span>
      </div>
    </Link>
  );
}

// ==========================================================================
// AppLayout Component
// ==========================================================================

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true); // mobile starts collapsed

  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth < 1024;
      // On desktop, always expand; on mobile, start collapsed
      if (!mobile) {
        setCollapsed(false);
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const handleToggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0e11]">
      <Sidebar collapsed={collapsed} onToggle={handleToggle}>
        {/* Logo */}
        <AppLogo />

        {/* Navigation */}
        <SidebarNav items={defaultNavItems} currentPath={pathname} />

        {/* User profile placeholder */}
        <div className="border-t border-[#1a1c1f] p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#333538] flex items-center justify-center text-sm text-[#b9cbbc]">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e2e2e6] truncate">
                Usuario
              </p>
              <p className="text-xs text-[#849587] truncate">
                Miembro
              </p>
            </div>
          </div>
        </div>
      </Sidebar>

      <MainContent>
        {children}
      </MainContent>
    </div>
  );
}
