import React from "react";
import Head from "next/head";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Gaudiya Kirtan",
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="A comprehensive repository of devotional songs"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-[var(--background-offset)] border-b border-[var(--tertiary)]/20">
        <div className="container mx-auto">
          <div className="flex items-center h-16 px-4">
            <button className="p-2 mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--tertiary)]/20"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
              </svg>
            </button>
            <span className="mr-2 text-[var(--tertiary)]">Songs</span>
            <span className="text-[var(--tertiary)]">/</span>

            <div className="flex-1 px-4">
              <div className="relative max-w-md ml-auto">
                <div className="flex items-center px-3 py-2 bg-[var(--highlight)]/20 dark:bg-[var(--tertiary)]/20 rounded-lg">
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
                    className="mr-2 text-[var(--tertiary)]"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                    <input
                    type="text"
                    placeholder="Search"
                    className="w-full text-[var(--tertiary)] bg-transparent border-none focus:outline-none"
                    ref={(input) => {
                      if (input) {
                      // Add event listener for cmd+k
                      const handleKeyDown = (e: KeyboardEvent) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                        e.preventDefault();
                        input.focus();
                        }
                      };
                      
                      document.addEventListener('keydown', handleKeyDown);
                      return () => {
                        document.removeEventListener('keydown', handleKeyDown);
                      };
                      }
                    }}
                    />
                  <span className="text-sm text-[var(--tertiary)]">⌘K</span>
                </div>
              </div>
            </div>

            <button className="p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--tertiary)]/20"
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
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-12">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <p className="text-sm text-center text-tertiary">
            &copy; {new Date().getFullYear()} Gaudiya Kirtan. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
