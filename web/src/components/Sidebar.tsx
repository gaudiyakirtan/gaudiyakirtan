import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, Sun, Moon, ChevronsLeft } from "lucide-react";
import { useTheme } from "../utils/ThemeContext";
import { LAYER } from "../utils/layers";
import { BrandWordmark } from "./BrandWordmark";
// Import directly from the leaf modules, not the '../services' barrel - the barrel re-exports
// fs-based repositories (songRepository, manifestRepository) that must never enter the client
// bundle, and Sidebar is a client-rendered component (see services/songListing.ts's note).
// Collections deferred (see the commented block below) — restore both imports with it.
// import { getSongGroups } from "../services/songGroupRepository";
// import { pickScriptText } from "../services/textDisplay";

import {
  HomeIcon,
  SongsIcon,
  TracksIcon,
  AuthorsIcon,
  TopicsIcon,
  BooksIcon,
  MetronomeIcon,
  TextIcon,
  SpeakerIcon,
  SettingsIcon,
  InfoIcon,
  MailIcon,
} from "./icons/SidebarIcons";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  /** Desktop collapse: the sidebar slides fully off-canvas (mobile uses the drawer). */
  collapsed?: boolean;
  setCollapsed?: (v: boolean) => void;
  /** Opens the centered search palette. */
  onOpenSearch?: () => void;
}

const NavItem: React.FC<{
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}> = ({ href, icon, label, active, onNavigate }) => (
  <Link
    href={href}
    onClick={onNavigate}
    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-[var(--highlight)]/15 text-[var(--highlight)]"
        : "text-[var(--neutral)] hover:bg-[var(--background-offset)] hover:text-[var(--primary)]"
    }`}
  >
    <span className={`flex w-5 flex-none justify-center ${active ? "text-[var(--highlight)]" : "text-[var(--neutral)] group-hover:text-[var(--primary)]"}`}>
      {icon}
    </span>
    <span className="truncate">{label}</span>
  </Link>
);

const GroupLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--neutral)]/70">
    {children}
  </p>
);

// Icon-only footer action. The label is intentionally not rendered — it becomes the accessible
// name (aria-label) and the hover tooltip (title), so the control is still announced by screen
// readers and discoverable by pointer users.
const IconNavItem: React.FC<{
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}> = ({ href, icon, label, active, onNavigate }) => (
  <Link
    href={href}
    onClick={onNavigate}
    aria-label={label}
    title={label}
    className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg transition-colors ${
      active
        ? "bg-[var(--highlight)]/15 text-[var(--highlight)]"
        : "text-[var(--neutral)] hover:bg-[var(--background-offset)] hover:text-[var(--primary)]"
    }`}
  >
    {icon}
  </Link>
);

// Theme toggle: labelled by the theme it switches TO (Gaura / Shyam), and on hover it softly previews
// that theme's *surface* colours (its background-offset + primary text) — not the harsh accent.
// This is the ONLY footer control that shows its label: the theme's current value is not derivable
// from a sun/moon glyph alone, whereas Settings/About/Contact are self-evident destinations.
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [hover, setHover] = useState(false);
  const targetIsGaura = theme === "dark"; // switching to Gaura when currently Shyam/dark
  const label = targetIsGaura ? "Gaura" : "Shyam";
  const bg = targetIsGaura ? "var(--gaur-background-offset)" : "var(--shyam-background-offset)";
  const fg = targetIsGaura ? "var(--gaur-primary)" : "var(--shyam-primary)";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={hover ? { backgroundColor: bg, color: fg } : undefined}
      aria-label={`Switch to the ${label} theme`}
      title={`Switch to the ${label} theme`}
      className={`group ml-auto flex min-w-0 items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--neutral)] transition-colors ${
        hover ? "" : "hover:bg-[var(--background-offset)]"
      }`}
    >
      <span className="flex flex-none items-center justify-center" style={hover ? { color: fg } : undefined}>
        {targetIsGaura ? <Sun size={18} /> : <Moon size={18} />}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, collapsed = false, setCollapsed, onOpenSearch }) => {
  const router = useRouter();
  // const collections = getSongGroups("collection"); // deferred with the Collections block

  const isActive = (path: string) => {
    if (router.pathname === path) return true;
    if (path !== "/" && router.pathname.startsWith(path + "/")) return true;
    return false;
  };

  const openSearch = () => {
    onOpenSearch?.();
    onClose?.();
  };

  return (
    <>
      {/* The scrim sits ABOVE the mini-player (LAYER.navigationScrim > LAYER.player): opening the
          drawer puts the whole current screen behind the dim, the player included, and the scrim —
          not the drawer — is what takes the tap that closes it. See docs/screens/navigation.md v3. */}
      {isOpen && (
        <div
          data-testid="nav-scrim"
          style={{ zIndex: LAYER.navigationScrim }}
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        data-testid="sidebar"
        style={{ zIndex: LAYER.navigationDrawer }}
        className={`fixed inset-y-0 left-0 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--background)] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:-translate-x-full" : "md:translate-x-0"}`}
      >
        {/* Brand + desktop collapse toggle (wordmark only — the mridanga music logo was removed).
            The container is `px-2` like the search box and nav, and the wordmark carries `pl-3` so
            its text starts at the same 20px inset as every nav icon below — one left edge down the
            whole sidebar. */}
        <div className="flex h-14 items-center px-2">
          <Link href="/" onClick={onClose} className="flex items-center pl-3" aria-label="Gaudiya Kirtan home">
            <BrandWordmark className="text-xl" />
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed?.(true)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="ml-auto hidden h-8 w-8 items-center justify-center rounded-lg text-[var(--neutral)] transition-colors hover:bg-[var(--background-offset)] hover:text-[var(--primary)] md:inline-flex"
          >
            <ChevronsLeft size={18} />
          </button>
        </div>

        {/* Search — opens the centered palette. `px-2` matches the nav so the search box's border and
            its icon line up with the nav items' hover box and icons (8px box / 20px icon). */}
        <div className="px-2 pb-2">
          <button
            type="button"
            onClick={openSearch}
            className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background-offset)] px-3 py-2 text-left text-[var(--neutral)] transition-colors hover:border-[var(--highlight)]"
          >
            <Search size={16} className="flex-none" />
            <span className="flex-1 text-sm">Search</span>
            <kbd className="hidden rounded border border-[var(--border)] px-1 text-[10px] sm:inline">⌘K</kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <div className="space-y-0.5">
            <NavItem href="/" icon={<HomeIcon />} label="Home" active={isActive("/")} onNavigate={onClose} />
          </div>

          <GroupLabel>Library</GroupLabel>
          <div className="space-y-0.5">
            <NavItem href="/songs" icon={<SongsIcon />} label="Songs" active={isActive("/songs")} onNavigate={onClose} />
            <NavItem href="/tracks" icon={<TracksIcon />} label="Tracks" active={isActive("/tracks")} onNavigate={onClose} />
            <NavItem href="/authors" icon={<AuthorsIcon />} label="Authors" active={isActive("/authors")} onNavigate={onClose} />
            <NavItem href="/topics" icon={<TopicsIcon />} label="Topics" active={isActive("/topics")} onNavigate={onClose} />
            <NavItem href="/books" icon={<BooksIcon />} label="Books" active={isActive("/books")} onNavigate={onClose} />
          </div>

          {/* Collections — DEFERRED. A curated/user-facing set is only meaningful once readers can
              own one, which needs auth + accounts; until then the corpus ships no `collection`-kind
              groups and this rendered a permanent "No collections yet". Restore this block (and the
              `collections` binding above) alongside the accounts work.
          <GroupLabel>Collections</GroupLabel>
          <div className="space-y-0.5">
            {collections.length === 0 ? (
              <p className="px-3 py-1 text-xs text-[var(--neutral)]">No collections yet</p>
            ) : (
              collections.map((c) => (
                <NavItem
                  key={c.uid}
                  href={`/collections/${c.uid}`}
                  icon={<SongsIcon />}
                  label={pickScriptText(c.titles, ["Latn", "Beng"])}
                  active={isActive(`/collections/${c.uid}`)}
                  onNavigate={onClose}
                />
              ))
            )}
          </div>
          */}

          <GroupLabel>Resources</GroupLabel>
          <div className="space-y-0.5">
            <NavItem href="/resources/meters" icon={<MetronomeIcon />} label="Verse Meters" active={isActive("/resources/meters")} onNavigate={onClose} />
            <NavItem href="/resources/diacritics" icon={<TextIcon />} label="Diacritic Guide" active={isActive("/resources/diacritics")} onNavigate={onClose} />
            <NavItem href="/resources/pronunciation" icon={<SpeakerIcon />} label="Pronunciation" active={isActive("/resources/pronunciation")} onNavigate={onClose} />
          </div>
        </nav>

        {/* Footer: one horizontal row — Settings / About / Contact as icon-only actions, then the
            theme toggle pushed right as the only labelled control (see ThemeToggle's note). */}
        <div className="flex items-center gap-1 border-t border-[var(--border)] p-2">
          <IconNavItem href="/settings" icon={<SettingsIcon />} label="Settings" active={isActive("/settings")} onNavigate={onClose} />
          <IconNavItem href="/about" icon={<InfoIcon />} label="About" active={isActive("/about")} onNavigate={onClose} />
          <IconNavItem href="/contact" icon={<MailIcon />} label="Contact" active={isActive("/contact")} onNavigate={onClose} />
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
