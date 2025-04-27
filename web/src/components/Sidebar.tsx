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
      <div className="flex-1 relative">
        {/* Always rendered to maintain layout */}
        <span className={`truncate max-w-[140px] transition-opacity duration-200 ${isCollapsed ? 'invisible' : 'visible'} ml-3`}>
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

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children, isCollapsed }) => {
  return (
    <div className="mb-6">
      <h2 className={`mb-2 ml-3 text-sm font-medium truncate pr-2 text-[var(--highlight)] transition-opacity duration-200 ${
        isCollapsed ? 'invisible' : 'visible'
      }`}>
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
        className="flex items-center relative w-full px-3 py-2 text-sm text-[var(--neutral)] hover:bg-[var(--background-offset)] rounded-md group"
      >
        <div className="flex justify-center w-[24px]">{icon}</div>
        <div className="flex-1 relative flex items-center">
          {/* Always rendered to maintain layout */}
          <span className={`truncate max-w-[140px] transition-opacity duration-200 ${isCollapsed ? 'invisible' : 'visible'} ml-3 flex-1`}>
            {title}
          </span>
          
          {/* Tooltip only visible on hover when collapsed */}
          {isCollapsed && (
            <span className="absolute left-[calc(100%+5px)] top-0 pl-2 bg-[var(--background-offset)] rounded-md py-1 px-2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 invisible group-hover:visible z-30 shadow-md">
              {title}
            </span>
          )}
          
          {/* Chevron icon - always rendered but invisible when collapsed */}
          <div className={`ml-2 ${isCollapsed ? 'invisible' : 'visible'}`}>
            {expanded ? (
              <ChevronDownIcon className="text-[var(--tertiary)]" />
            ) : (
              <ChevronRightIcon className="text-[var(--tertiary)]" />
            )}
          </div>
        </div>
      </button>
      
      {/* Content container - always rendered but height 0 when not expanded/collapsed */}
      <div className={`transition-all duration-200 ml-6 ${expanded && !isCollapsed ? 'mt-1 max-h-96' : 'max-h-0 overflow-hidden'}`}>
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

  // Base width and expanded width on hover
  const sidebarWidth = isHovering ? "w-64" : "w-16";

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
        {/* Toggle button container */}
        <div className="flex items-center justify-center pt-2 mb-2">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[var(--neutral)] hover:text-[var(--highlight)] transition-colors"
            title={isCollapsed ? "Lock expanded sidebar" : "Collapse sidebar"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isCollapsed ? (
                // Arrow pointing right (collapsed)
                <>
                  <path d="M9 18l6-6-6-6" />
                </>
              ) : (
                // Arrow pointing left (expanded) 
                <>
                  <path d="M15 18l-6-6 6-6" />
                </>
              )}
            </svg>
          </button>
        </div>

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
            <SidebarItem
              href="/collections"
              icon={<SongsIcon className="text-[var(--neutral)]" />}
              label="Collections"
              isActive={isActive("/collections")}
              isCollapsed={!showExpanded}
            />
            <SidebarItem
              href="/collections/new"
              icon={<PlusIcon className="text-[var(--neutral)]" />}
              label="New Collection"
              isActive={isActive("/collections/new")}
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
          {/* Settings at the bottom */}
          <button className="flex items-center relative w-full px-3 py-2 text-sm text-[var(--neutral)] hover:bg-[var(--background-offset)] rounded-md group">
            <div className="flex justify-center w-[24px]">
              <SettingsIcon className="text-[var(--tertiary)]" />
            </div>
            <span className={`transition-all duration-200 truncate max-w-[140px] ${
              isCollapsed 
                ? 'invisible absolute left-[calc(100%+5px)] pl-2 bg-[var(--background-offset)] rounded-md py-1 px-2 text-xs whitespace-nowrap group-hover:visible group-hover:opacity-100 z-30 shadow-md opacity-0' 
                : 'visible opacity-100 ml-3'
            }`}>
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
