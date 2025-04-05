import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
  SettingsIcon
} from './icons/SidebarIcons';

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
  { id: 'song1', title: 'E ghora-saṃsāre' },
  { id: 'song2', title: 'Bol hari bol' },
  { id: 'song3', title: 'Jaya jaya śrī guru' },
  { id: 'song4', title: 'Kothāy go' },
  { id: 'song5', title: 'Ātma-nivedana' },
];

const collections = [
  { id: 'col1', name: 'Favorites', songs: favoriteSongs },
  { id: 'col2', name: 'IPBYS', songs: [] },
  { id: 'col3', name: 'Kartik Songs', songs: [] },
  { id: 'col4', name: 'Memorize', songs: [] },
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
        isActive ? 'bg-[var(--background-offset)] text-[var(--highlight)]' : 'text-[var(--primary)]'
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
      <h2 className="mb-2 ml-3 text-xs font-medium text-[var(--highlight)]">{title}</h2>
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
        className="flex items-center justify-between w-full px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--background-offset)] rounded-md"
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
  const [expandedCollection, setExpandedCollection] = useState('col1');

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <div 
      className={`fixed top-0 left-0 z-20 h-full bg-[var(--background)] w-64 border-r border-[var(--border)] transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        {/* User profile */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2 overflow-hidden rounded-full bg-[var(--highlight)]">
              <div className="flex items-center justify-center w-full h-full text-lg font-medium text-[var(--background)]">
                S
              </div>
            </div>
            <span className="text-sm font-medium text-[var(--primary)]">Shyam</span>
          </div>
          <button className="p-1 rounded-md hover:bg-[var(--background-offset)]">
            <SettingsIcon className="text-[var(--tertiary)]" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          <SidebarItem
            href="/"
            icon={<HomeIcon className={isActive('/') ? 'text-[var(--highlight)]' : 'text-[var(--primary)]'} />}
            label="Home"
            isActive={isActive('/')}
          />

          <SidebarSection title="LIBRARY">
            <SidebarItem
              href="/songs"
              icon={<SongsIcon className={isActive('/songs') ? 'text-[var(--highlight)]' : 'text-[var(--primary)]'} />}
              label="Songs"
              isActive={isActive('/songs')}
            />
            <SidebarItem
              href="/authors"
              icon={<AuthorsIcon className={isActive('/authors') ? 'text-[var(--highlight)]' : 'text-[var(--primary)]'} />}
              label="Authors"
              isActive={isActive('/authors')}
            />
            <SidebarItem
              href="/topics"
              icon={<TopicsIcon className={isActive('/topics') ? 'text-[var(--highlight)]' : 'text-[var(--primary)]'} />}
              label="Topics"
              isActive={isActive('/topics')}
            />
            <SidebarItem
              href="/books"
              icon={<BooksIcon className={isActive('/books') ? 'text-[var(--highlight)]' : 'text-[var(--primary)]'} />}
              label="Books"
              isActive={isActive('/books')}
            />
          </SidebarSection>

          <SidebarSection title="COLLECTIONS">
            {collections.map((collection) => (
              <CollapsibleSection
                key={collection.id}
                title={collection.name}
                icon={<SongsIcon className="text-[var(--primary)]" />}
                isExpanded={collection.id === expandedCollection}
                onClick={() => setExpandedCollection(collection.id)}
              >
                {collection.songs.map((song) => (
                  <Link
                    key={song.id}
                    href={`/songs/${song.id}`}
                    className="flex items-center px-2 py-1 text-xs text-[var(--primary)] rounded hover:bg-[var(--background-offset)]"
                  >
                    {song.title}
                  </Link>
                ))}
              </CollapsibleSection>
            ))}
            <SidebarItem
              href="/collections/new"
              icon={<PlusIcon className="text-[var(--primary)]" />}
              label="New Collection"
            />
          </SidebarSection>

          <SidebarSection title="RESOURCES">
            <SidebarItem
              href="/resources/meters"
              icon={<MetronomeIcon className="text-[var(--primary)]" />}
              label="Verse Meters"
            />
            <SidebarItem
              href="/resources/diacritics"
              icon={<TextIcon className="text-[var(--primary)]" />}
              label="Diacritic Guide"
            />
            <SidebarItem
              href="/resources/pronunciation"
              icon={<SpeakerIcon className="text-[var(--primary)]" />}
              label="Pronunciation"
            />
          </SidebarSection>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;