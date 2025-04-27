import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import {
  HomeIcon,
  SongsIcon,
  AuthorsIcon,
  TopicsIcon,
  BooksIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  MetronomeIcon,
  TextIcon,
  SpeakerIcon,
  SettingsIcon,
} from "./icons/SidebarIcons";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  isCollapsed?: boolean;
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  isCollapsed?: boolean;
}

const favoriteSongs = [
  { id: "song1", title: "E ghora-saṃsāre" },
  { id: "song2", title: "Bol hari bol" },
  { id: "song3", title: "Jaya jaya śrī guru" },
  { id: "song4", title: "Kothāy go" },
  { id: "song5", title: "Ātma-nivedana" },
];

const collections = [
  { id: "col1", name: "Favorites", songs: favoriteSongs },
  { id: "col2", name: "IPBYS", songs: [] },
  { id: "col3", name: "Kartik Songs", songs: [] },
  { id: "col4", name: "Memorize", songs: [] },
];

const SidebarItem: React.FC<SidebarItemProps> = ({
  href,
  icon,
  label,
  isActive,
  onClick,
  isCollapsed,
}) => {
  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={`flex items-center px-3 py-2 text-sm rounded-md group hover:bg-[var(--background-offset)] ${
        isActive
          ? "bg-[var(--background-offset)] text-[var(--neutral)]"
          : "text-[var(--neutral)]"
      } ${isCollapsed ? 'justify-center' : ''}`}
      onClick={onClick}
    >
      <div className={isCollapsed ? '' : 'mr-2'}>{icon}</div>
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children, isCollapsed }) => {
  return (
    <div className="mb-6">
      {!isCollapsed && (
        <h2 className="mb-2 ml-3 text-sm font-medium text-[var(--highlight)]">
          {title}
        </h2>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
};

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  isExpanded = false,
  children,
  onClick,
  isCollapsed,
}) => {
  const [expanded, setExpanded] = useState(isExpanded);

  const toggleExpanded = () => {
    setExpanded(!expanded);
    if (onClick) onClick();
  };

  return (
    <div>
      <button
        onClick={toggleExpanded}
        title={isCollapsed ? title : undefined}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm text-[var(--neutral)] hover:bg-[var(--background-offset)] rounded-md ${
          isCollapsed ? 'justify-center' : ''
        }`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className={isCollapsed ? '' : 'mr-2'}>{icon}</div>
          {!isCollapsed && <span>{title}</span>}
        </div>
        {!isCollapsed && (
          expanded ? (
            <ChevronDownIcon className="text-[var(--tertiary)]" />
          ) : (
            <ChevronRightIcon className="text-[var(--tertiary)]" />
          )
        )}
      </button>
      {expanded && !isCollapsed && <div className="mt-1 ml-6">{children}</div>}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [expandedCollection, setExpandedCollection] = useState("col1");
  const [isCollapsed, setIsCollapsed] = useState(true); // Sidebar starts collapsed
  const [isHovering, setIsHovering] = useState(false);

  const isActive = (path: string) => {
    // Check if the current path exactly matches the given path
    if (router.pathname === path) return true;
    
    // Check if the current path is a subpath (e.g., /songs/123 matches /songs)
    if (path !== '/' && router.pathname.startsWith(path + '/')) return true;
    
    return false;
  };

  // Handle hover effect
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  // Determine if sidebar should be expanded
  const showExpanded = isHovering || !isCollapsed;

  // Set width based on collapsed state
  const sidebarWidth = showExpanded ? "w-64" : "w-16";

  return (
    <div
      className={`fixed top-0 left-0 z-20 h-full bg-[var(--background)] ${sidebarWidth} border-r border-[var(--border)] transition-all duration-300 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full">
        {/* Gaudiya Kirtan */}
        <div className={`flex items-center justify-between ${showExpanded ? "p-4" : "p-3"}`}>
          <div className={`flex items-center ${showExpanded ? "" : "justify-center w-full"}`}>
            <Image
              src="/assets/mridanga.svg"
              alt="Mridanga"
              width={32}
              height={32}
              className={`w-8 h-8 ${showExpanded ? "mr-3" : ""}`}
            />
            {showExpanded && (
              <Image
                src="/assets/sri-gaudiya-kirtan.svg"
                alt="Sri Gaudiya Kirtan"
                width={148}
                height={32}
              />
            )}
          </div>
          {showExpanded && (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-[var(--neutral)] hover:text-[var(--highlight)] transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Sidebar content */}
        <div className={`flex-1 ${showExpanded ? "p-3" : "p-1"} space-y-1 overflow-y-auto`}>
          <SidebarItem
            href="/"
            icon={
              <HomeIcon
                className={
                  isActive("/")
                    ? "text-[var(--neutral)]"
                    : "text-[var(--neutral)]"
                }
              />
            }
            label="Home"
            isActive={isActive("/")}
            isCollapsed={!showExpanded}
          />

          <SidebarSection title="Library" isCollapsed={!showExpanded}>
            <SidebarItem
              href="/songs"
              icon={
                <SongsIcon
                  className={
                    isActive("/songs")
                      ? "text-[var(--neutral)]"
                      : "text-[var(--neutral)]"
                  }
                />
              }
              label="Songs"
              isActive={isActive("/songs")}
              isCollapsed={!showExpanded}
            />
            <SidebarItem
              href="/authors"
              icon={
                <AuthorsIcon
                  className={
                    isActive("/authors")
                      ? "text-[var(--neutral)]"
                      : "text-[var(--neutral)]"
                  }
                />
              }
              label="Authors"
              isActive={isActive("/authors")}
              isCollapsed={!showExpanded}
            />
            <SidebarItem
              href="/topics"
              icon={
                <TopicsIcon
                  className={
                    isActive("/topics")
                      ? "text-[var(--neutral)]"
                      : "text-[var(--neutral)]"
                  }
                />
              }
              label="Topics"
              isActive={isActive("/topics")}
              isCollapsed={!showExpanded}
            />
            <SidebarItem
              href="/books"
              icon={
                <BooksIcon
                  className={
                    isActive("/books")
                      ? "text-[var(--neutral)]"
                      : "text-[var(--neutral)]"
                  }
                />
              }
              label="Books"
              isActive={isActive("/books")}
              isCollapsed={!showExpanded}
            />
          </SidebarSection>

          <SidebarSection title="Collections" isCollapsed={!showExpanded}>
            {showExpanded && collections.map((collection) => (
              <CollapsibleSection
                key={collection.id}
                title={collection.name}
                icon={<SongsIcon className="text-[var(--neutral)]" />}
                isExpanded={collection.id === expandedCollection}
                onClick={() => setExpandedCollection(collection.id)}
                isCollapsed={!showExpanded}
              >
                {collection.songs.map((song) => (
                  <Link
                    key={song.id}
                    href={`/songs/${song.id}`}
                    className="flex items-center px-2 py-1 text-xs text-[var(--neutral)] rounded hover:bg-[var(--background-offset)]"
                  >
                    {song.title}
                  </Link>
                ))}
              </CollapsibleSection>
            ))}
            {!showExpanded && (
              <SidebarItem
                href="/collections"
                icon={<SongsIcon className="text-[var(--neutral)]" />}
                label="Collections"
                isCollapsed={!showExpanded}
              />
            )}
            {showExpanded && (
              <SidebarItem
                href="/collections/new"
                icon={<PlusIcon className="text-[var(--neutral)]" />}
                label="New Collection"
                isCollapsed={!showExpanded}
              />
            )}
          </SidebarSection>

          <SidebarSection title="Resources" isCollapsed={!showExpanded}>
            <SidebarItem
              href="/resources/meters"
              icon={<MetronomeIcon className="text-[var(--neutral)]" />}
              label="Verse Meters"
              isCollapsed={!showExpanded}
            />
            <SidebarItem
              href="/resources/diacritics"
              icon={<TextIcon className="text-[var(--neutral)]" />}
              label="Diacritic Guide"
              isCollapsed={!showExpanded}
            />
            <SidebarItem
              href="/resources/pronunciation"
              icon={<SpeakerIcon className="text-[var(--neutral)]" />}
              label="Pronunciation"
              isCollapsed={!showExpanded}
            />
          </SidebarSection>
          {/* Settings at the bottom */}
          <button className={`flex items-center w-full px-3 py-2 text-sm text-[var(--neutral)] hover:bg-[var(--background-offset)] rounded-md ${!showExpanded ? 'justify-center' : 'justify-between'}`}>
            <div className={`flex items-center ${!showExpanded ? 'justify-center' : ''}`}>
              <SettingsIcon className={showExpanded ? "mr-2 text-[var(--tertiary)]" : "text-[var(--tertiary)]"} />
              {showExpanded && <span>Settings</span>}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
