import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Gaudiya Kirtan",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

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
    <div className="flex min-h-screen bg-[var(--background)]">
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="A comprehensive repository of devotional songs"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 md:pl-64">
        <header className="bg-[var(--background-offset)] border-b border-[var(--border)]">
          <div className="flex items-center h-16 px-4">
            <button
              className="p-2 mr-2 md:hidden"
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

            <div className="flex items-center">
              <span className="mr-2 text-[var(--tertiary)]">
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
              {router.pathname !== "/" && (
                <span className="text-[var(--tertiary)]">/</span>
              )}
            </div>

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
            </button>
          </div>
        </header>

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
  );
};

export default Layout;
