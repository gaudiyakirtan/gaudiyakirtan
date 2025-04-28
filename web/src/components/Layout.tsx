import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import { useTheme } from "../utils/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Gaudiya Kirtan",
  subtitle,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Close sidebar on route change on mobile
  useEffect(() => {
    const handleRouteChange = () => {
      setSidebarOpen(false);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] overflow-x-hidden">
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="A comprehensive repository of devotional songs"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header - Now spans full width and sticky */}
      <header className="fixed top-0 left-0 right-0 bg-[var(--background-offset)] border-b border-[var(--border)] z-30">
        <div className="flex items-center h-12 px-4">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="p-2 mr-3 md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
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
                className="text-[var(--tertiary)]"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            
            {/* Gaudiya Kirtan Logo - Moved from sidebar to header */}
            <div className="flex items-center mr-4">
              <img
                src="/assets/mridanga.svg"
                alt="Mridanga"
                className="w-6 h-6 mr-3"
              />
              <img
                src="/assets/sri-gaudiya-kirtan.svg"
                alt="Sri Gaudiya Kirtan"
                className="h-5 hidden sm:block"
              />
            </div>
            
            {/* Sidebar toggle button - only visible on desktop */}
            <button
              className="p-2 mx-2 hidden md:flex"
              onClick={() => {
                // This will update the isCollapsed state in the Sidebar component
                const event = new CustomEvent('toggleSidebar');
                window.dispatchEvent(event);
              }}
              title="Toggle sidebar"
            >
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
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>
            
            {/* Divider */}
            <div className="h-6 border-l border-[var(--border)] mx-3 hidden sm:block"></div>

            <div className="flex items-center">
              <span className="mr-2 text-[var(--tertiary)] text-sm">
                {router.pathname === "/"
                  ? "Home"
                  : router.pathname.startsWith("/songs")
                  ? "Songs"
                  : router.pathname.startsWith("/authors")
                  ? "Authors"
                  : router.pathname.startsWith("/topics")
                  ? "Topics"
                  : router.pathname.startsWith("/books")
                  ? "Books"
                  : router.pathname.startsWith("/collections")
                  ? "Collections"
                  : router.pathname.startsWith("/resources")
                  ? "Resources"
                  : ""}
              </span>
              
              {subtitle && (
                <>
                  <span className="text-[var(--tertiary)] text-sm">/</span>
                  <span className="ml-2 text-[var(--tertiary)] text-sm truncate max-w-[150px] sm:max-w-[300px]">{subtitle}</span>
                </>
              )}
              
              {router.pathname !== "/" && !subtitle && (
                <span className="text-[var(--tertiary)] text-sm">/</span>
              )}
            </div>
          </div>

          <div className="flex-1 px-4">
            <div className="relative max-w-md ml-auto">
              <div className="flex items-center px-2 py-1 bg-[var(--highlight)]/20 dark:bg-[var(--tertiary)]/20 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
                  className="w-full text-[var(--primary)] bg-transparent border-none focus:outline-none"
                  ref={(input) => {
                    if (input) {
                      // Add event listener for cmd+k
                      const handleKeyDown = (e: KeyboardEvent) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                          e.preventDefault();
                          input.focus();
                        }
                      };

                      document.addEventListener("keydown", handleKeyDown);
                      return () => {
                        document.removeEventListener(
                          "keydown",
                          handleKeyDown
                        );
                      };
                    }
                  }}
                />
                <span className="text-sm text-[var(--tertiary)]">⌘K</span>
              </div>
            </div>
          </div>

          {/* Theme toggle button removed from header */}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden pt-12">
        {/* Sidebar - Now below header */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-x-hidden md:ml-16 transition-all duration-300 main-content">
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>

          <footer className="mt-auto">
            <div className="px-4 py-6 mx-auto sm:px-6 lg:px-8">
              <p className="text-sm text-center text-[var(--tertiary)]">
                &copy; {new Date().getFullYear()} Gaudiya Kirtan. All rights
                reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;
