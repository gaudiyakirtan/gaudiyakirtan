import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTheme } from "../utils/ThemeContext";

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
      className={`flex items-center px-3 py-2 text-sm rounded-md group hover:bg-[var(--background-offset)] relative ${
        isActive
          ? "bg-[var(--background-offset)] text-[var(--neutral)]"
          : "text-[var(--neutral)]"
      }`}
      onClick={onClick}
    >
      <div className="flex justify-center w-[24px]">{icon}</div>
      <div className="relative flex flex-1">
        {/* Always rendered to maintain layout */}
        <span className={`truncate max-w-[140px] transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'} ml-3 text-right`}>
          {label}
        </span>
        
        {/* Tooltip only visible on hover when collapsed */}
        {isCollapsed && (
          <span className="absolute left-[calc(100%+5px)] top-0 pl-2 bg-[var(--background-offset)] rounded-md py-1 px-2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 invisible group-hover:visible z-30 shadow-md">
            {label}
          </span>
        )}
      </div>
    </Link>
  );
};

const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  children,
  isCollapsed,
}) => {
  return (
    <div className="mb-6">
      <h2
        className={`mb-2 ml-3 text-sm font-medium text-[var(--highlight)] transition-opacity duration-200 pr-3 ${
          isCollapsed ? "opacity-0" : "opacity-100"
        }`}
      >
        {title}
      </h2>
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
        className="flex items-center w-full px-3 py-2 text-sm text-[var(--neutral)] hover:bg-[var(--background-offset)] rounded-md group relative"
      >
        <div className="flex justify-center w-[24px]">{icon}</div>
        <div className="relative flex items-center flex-1">
          {/* Always rendered to maintain layout */}
          <span className={`truncate max-w-[140px] transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'} ml-3 flex-1 text-left`}>
            {title}
          </span>
          
          {/* Tooltip only visible on hover when collapsed */}
          {isCollapsed && (
            <span className="absolute left-[calc(100%+5px)] top-0 pl-2 bg-[var(--background-offset)] rounded-md py-1 px-2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 invisible group-hover:visible z-30 shadow-md">
              {title}
            </span>
          )}
          
          {/* Chevron icon - always rendered but invisible when collapsed */}
          <div className={`ml-2 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            {expanded ? (
              <ChevronDownIcon className="text-[var(--tertiary)]" />
            ) : (
              <ChevronRightIcon className="text-[var(--tertiary)]" />
            )}
          </div>
        </div>
      </button>
      
      {/* Content container - always rendered but height 0 when not expanded/collapsed */}
      <div className={`transition-all duration-200 ml-6 overflow-hidden ${expanded && !isCollapsed ? 'mt-1 max-h-96' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [expandedCollection, setExpandedCollection] = useState(""); // No expanded collection by default
  const [isCollapsed, setIsCollapsed] = useState(true); // Sidebar starts collapsed
  const [isHovering, setIsHovering] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
  
  // Listen for toggle sidebar event from header button
  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsCollapsed(!isCollapsed);
    };
    
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
    };
  }, [isCollapsed]);
  
  // Update main content margin when sidebar width changes
  const showExpanded = isHovering || !isCollapsed;

  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      if (showExpanded) {
        mainContent.classList.remove('md:ml-16');
        mainContent.classList.add('md:ml-64');
      } else {
        mainContent.classList.remove('md:ml-64');
        mainContent.classList.add('md:ml-16');
      }
    }
  }, [showExpanded]);

  // Determine if sidebar should be expanded

  // Base width when collapsed and expanded width on hover
  const sidebarWidth = showExpanded ? "w-64" : "w-16";

  return (
    <div
      className={`fixed top-12 left-0 z-20 h-[calc(100vh-3rem)] bg-[var(--background)] ${sidebarWidth} border-r border-[var(--border)] transition-all duration-300 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 overflow-visible`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="flex flex-col h-full">

        {/* Sidebar content */}
        <div className="flex-1 p-2 space-y-1 overflow-y-auto hide-scrollbar">
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
            {collections.map((collection) => (
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
            <SidebarItem
              href="/collections/new"
              icon={<PlusIcon className="text-[var(--neutral)]" />}
              label="New Collection"
              isCollapsed={!showExpanded}
            />
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
        </div>
        
        {/* Theme and Settings at the bottom */}
        <div className="p-2 mt-auto mb-4">
          {/* Theme toggle button */}
          <button 
            className="flex items-center relative w-full px-3 py-2 text-sm text-[var(--neutral)] hover:bg-[var(--background-offset)] rounded-md group mb-1"
            onClick={toggleTheme}
          >
            <div className="flex justify-center w-[24px]">
              {theme === 'light' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--tertiary)]"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--tertiary)]"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </div>
            <div className="relative flex flex-1">
              <span className={`transition-opacity duration-200 truncate max-w-[140px] ${!showExpanded ? 'opacity-0' : 'opacity-100'} ml-3`}>
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
              
              {/* Tooltip only visible on hover when collapsed */}
              {!showExpanded && (
                <span className="absolute left-[calc(100%+5px)] top-0 pl-2 bg-[var(--background-offset)] rounded-md py-1 px-2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 invisible group-hover:visible z-30 shadow-md">
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
              )}
            </div>
          </button>
          
          {/* Settings button */}
          <button className="flex items-center relative w-full px-3 py-2 text-sm text-[var(--neutral)] hover:bg-[var(--background-offset)] rounded-md group">
            <div className="flex justify-center w-[24px]">
              <SettingsIcon className="text-[var(--tertiary)]" />
            </div>
            <div className="relative flex flex-1">
              <span className={`transition-opacity duration-200 truncate max-w-[140px] ${!showExpanded ? 'opacity-0' : 'opacity-100'} ml-3 text-right`}>
                Settings
              </span>
              
              {/* Tooltip only visible on hover when collapsed */}
              {!showExpanded && (
                <span className="absolute left-[calc(100%+5px)] top-0 pl-2 bg-[var(--background-offset)] rounded-md py-1 px-2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 invisible group-hover:visible z-30 shadow-md">
                  Settings
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;