import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PanelLeft } from "lucide-react";
import { BrandWordmark } from "./BrandWordmark";
import Sidebar from "./Sidebar";
import { PlayerWidget } from "./PlayerWidget";
import { SearchModal } from "./SearchModal";
import { ReaderOptions } from "./ReaderOptions";
import { ServiceWorkerRegistration } from "./ServiceWorkerRegistration";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title = "Gaudiya Kirtan" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  // Global Cmd/Ctrl+K opens the search palette from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Restore the persisted desktop collapse preference.
  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebar-collapsed") === "1");
  }, []);

  // Publish the collapse state on <html> so a component that isn't a child of Layout (the song
  // reader's sticky "Display" control) can shift clear of the floating "Open sidebar" button that
  // only appears when collapsed — without threading the state through as a prop.
  useEffect(() => {
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "open";
  }, [collapsed]);
  const updateCollapsed = (v: boolean) => {
    setCollapsed(v);
    localStorage.setItem("sidebar-collapsed", v ? "1" : "0");
  };

  // Close the mobile drawer on navigation.
  useEffect(() => {
    const close = () => setSidebarOpen(false);
    router.events.on("routeChangeComplete", close);
    return () => router.events.off("routeChangeComplete", close);
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Head>
        <title>{title}</title>
        <meta name="description" content="A comprehensive repository of devotional songs" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Two tags, not one: manifest.json can only declare a single static theme_color, but the
            browser chrome should track whichever palette (Gaura/Shyam) is actually on screen.
            Values are the two palettes' `background`, matching the mobile header below
            (bg-[var(--background)]) so the OS status bar blends with it instead of clashing. */}
        <meta name="theme-color" content="#FFF4E8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#191919" media="(prefers-color-scheme: dark)" />
      </Head>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        setCollapsed={updateCollapsed}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* When the sidebar is collapsed (fully off-canvas), a floating button reopens it (desktop). */}
      <button
        type="button"
        onClick={() => updateCollapsed(false)}
        aria-label="Open sidebar"
        title="Open sidebar"
        className={`fixed left-3 top-3 z-30 hidden h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background-offset)] text-[var(--neutral)] shadow-sm transition-colors hover:text-[var(--primary)] ${collapsed ? "md:flex" : "md:hidden"}`}
      >
        <PanelLeft size={18} />
      </button>

      {/* Content column, offset by the fixed sidebar on desktop. No top bar on desktop
          (Notion-style) - only a slim mobile header carries the menu toggle + wordmark. */}
      <div className={`flex min-h-screen flex-col transition-[margin] duration-300 ${collapsed ? "md:ml-0" : "md:ml-64"}`}>
        {/* Mobile-only header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--background)] px-4 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
            className="text-[var(--neutral)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/" className="flex items-center">
            <BrandWordmark className="text-lg" />
          </Link>
          {/* Reader display options — only on a song screen, which publishes its capabilities via
              ReaderOptionsContext (the control renders nothing otherwise). It lives here on mobile
              because there is no room for a floating sticky control over a phone-width reader.
              Opens right-aligned so the panel stays on screen. */}
          <div className="ml-auto">
            <ReaderOptions variant="icon" align="right" />
          </div>

          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="text-[var(--neutral)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </header>

        {/* No horizontal gutter on mobile: every page/section already carries its own `px-4`, so a
            gutter here doubled it (32px per side, cramping phones). Desktop keeps `md:px-8`; the few
            prose/detail pages that lean on this gutter add a mobile-only `px-4 md:px-0` themselves. */}
        <main className="flex-1 py-6 md:px-8">{children}</main>

        <footer>
          <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-[var(--neutral)]">
              &copy; {new Date().getFullYear()} Gaudiya Kirtan. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      <PlayerWidget />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ServiceWorkerRegistration />
    </div>
  );
};

export default Layout;
