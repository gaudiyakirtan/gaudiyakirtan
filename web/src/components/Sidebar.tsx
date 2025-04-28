import React, { useState } from "react";
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
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
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
}) => {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 text-sm rounded-md group hover:bg-[var(--background-offset)] ${
        isActive
          ? "bg-[var(--background-offset)] text-[var(--neutral)]"
          : "text-[var(--neutral)]"
      }`}
      onClick={onClick}
    >
      <div className="mr-2">{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-6">
      <h2 className="mb-2 ml-3 text-sm font-medium text-[var(--highlight)]">
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
        className="flex items-center justify-between w-full px-3 py-2 text-sm text-[var(--neutral)] hover:bg-[var(--background-offset)] rounded-md"
      >
        <div className="flex items-center">
          <div className="mr-2">{icon}</div>
          <span>{title}</span>
        </div>
        {expanded ? (
          <ChevronDownIcon className="text-[var(--tertiary)]" />
        ) : (
          <ChevronRightIcon className="text-[var(--tertiary)]" />
        )}
      </button>
      {expanded && <div className="mt-1 ml-6">{children}</div>}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [expandedCollection, setExpandedCollection] = useState("col1");

  const isActive = (path: string) => {
    // Check if the current path exactly matches the given path
    if (router.pathname === path) return true;

    // Check if the current path is a subpath (e.g., /songs/123 matches /songs)
    if (path !== "/" && router.pathname.startsWith(path + "/")) return true;

    return false;
  };

  return (
    <div
      className={`fixed top-0 left-0 z-20 h-full bg-[var(--background)] w-64 border-r border-[var(--border)] transition-transform duration-300 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        {/* Gaudiya Kirtan */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Image
              src="/assets/mridanga.svg"
              alt="Mridanga"
              width={32}
              height={32}
              className="w-8 h-8 mr-3"
            />
            <Image
              src="/assets/sri-gaudiya-kirtan.svg"
              alt="Sri Gaudiya Kirtan"
              width={148}
              height={32}
            />
          </div>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
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
          />

          <SidebarSection title="Library">
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
            />
          </SidebarSection>

          <SidebarSection title="Collections">
            {collections.map((collection) => (
              <CollapsibleSection
                key={collection.id}
                title={collection.name}
                icon={<SongsIcon className="text-[var(--neutral)]" />}
                isExpanded={collection.id === expandedCollection}
                onClick={() => setExpandedCollection(collection.id)}
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
            />
          </SidebarSection>

          <SidebarSection title="Resources">
            <SidebarItem
              href="/resources/meters"
              icon={<MetronomeIcon className="text-[var(--neutral)]" />}
              label="Verse Meters"
            />
            <SidebarItem
              href="/resources/diacritics"
              icon={<TextIcon className="text-[var(--neutral)]" />}
              label="Diacritic Guide"
            />
            <SidebarItem
              href="/resources/pronunciation"
              icon={<SpeakerIcon className="text-[var(--neutral)]" />}
              label="Pronunciation"
            />
          </SidebarSection>
          {/* Settings at the bottom */}
          <button className="flex items-center justify-between w-full px-3 py-2 text-sm text-[var(--neutral)] hover:bg-[var(--background-offset)] rounded-md">
            <div className="flex items-center">
              <SettingsIcon className="mr-2 text-[var(--tertiary)]" />
              <span>Settings</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
