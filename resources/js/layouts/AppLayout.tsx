import React, { useState, useEffect, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import NavLink from '../components/NavLink';
import Dropdown from '../components/Dropdown';
import ResponsiveNavLink from '../components/ResponsiveNavLink';
import DarkModeToggle from '@/components/DarkModeToggle';
import { Auth } from '@/types/user';
import { PageProps } from '@inertiajs/core';

interface AppLayoutProps {
  children: ReactNode;
}

interface CustomPageProps extends PageProps {
  auth: Auth;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { auth } = usePage<CustomPageProps>().props;
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className={`fixed top-0 left-0 right-0 z-40 ${scrolled ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm' : 'bg-white dark:bg-gray-800'} transition-all duration-200 border-b border-gray-200 dark:border-gray-700`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="shrink-0 flex items-center">
                <Link href="/">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <span className="ml-2 font-bold text-xl">MangaPulse</span>
                  </div>
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                <NavLink href="/" active={route().current('home')}>
                  Home
                </NavLink>
                <NavLink href="/manga" active={route().current('manga.index')}>
                  Browse
                </NavLink>
                {auth.user && (
                  <>
                    <NavLink href="/library" active={route().current('library.index')}>
                      My Library
                    </NavLink>
                    <NavLink href="/history" active={route().current('history.index')}>
                      History
                    </NavLink>
                  </>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md px-4 hidden md:flex items-center">
              <div className="w-full">
                <form action="/manga" method="get">
                  <div className="relative text-gray-400 focus-within:text-gray-600">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                      <svg 
                        className="h-5 w-5" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                      </svg>
                    </span>
                    <input
                      type="search"
                      name="search"
                      placeholder="Search manga..."
                      className="w-full py-2 pl-10 pr-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </form>
              </div>
            </div>

            <div className="hidden sm:flex sm:items-center sm:ml-6">
              {/* Dark Mode Toggle */}
              <div className="mr-4">
                <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </div>

              {/* User Dropdown */}
              {auth.user ? (
                <div className="ml-3 relative">
                  <Dropdown>
                    <Dropdown.Trigger>
                      <span className="inline-flex rounded-md">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-full text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150"
                        >
                          {auth.user.name}

                          <svg
                            className="ml-2 -mr-0.5 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    </Dropdown.Trigger>

                    <Dropdown.Content>
                      <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                      <Dropdown.Link href={route('library.index')}>My Library</Dropdown.Link>
                      <Dropdown.Link href={route('history.index')}>Reading History</Dropdown.Link>
                      <Dropdown.Link href={route('logout')} method="post" as="button">
                        Log Out
                      </Dropdown.Link>
                    </Dropdown.Content>
                  </Dropdown>
                </div>
              ) : (
                <div className="space-x-4">
                  <Link
                    href={route('login')}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Log in
                  </Link>

                  <Link
                    href={route('register')}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-full font-medium text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 focus:text-gray-500 dark:focus:text-gray-400 transition duration-150 ease-in-out"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path
                    className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                  <path
                    className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Navigation Menu */}
        <div
          className={`${
            showingNavigationDropdown ? 'block' : 'hidden'
          } sm:hidden`}
        >
          <div className="pt-2 pb-3 space-y-1">
            <ResponsiveNavLink href="/" active={route().current('home')}>
              Home
            </ResponsiveNavLink>
            <ResponsiveNavLink href="/manga" active={route().current('manga.index')}>
              Browse
            </ResponsiveNavLink>
            {auth.user && (
              <>
                <ResponsiveNavLink href="/library" active={route().current('library.index')}>
                  My Library
                </ResponsiveNavLink>
                <ResponsiveNavLink href="/history" active={route().current('history.index')}>
                  History
                </ResponsiveNavLink>
              </>
            )}
          </div>

          {/* Responsive Search */}
          <div className="pt-2 pb-3 px-4">
            <form action="/manga" method="get">
              <div className="relative text-gray-400 focus-within:text-gray-600">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <svg 
                    className="h-5 w-5" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  name="search"
                  placeholder="Search manga..."
                  className="w-full py-2 pl-10 pr-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </form>
          </div>

          {/* Responsive Settings Options */}
          {auth.user ? (
            <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-600">
              <div className="px-4">
                <div className="font-medium text-base text-gray-800 dark:text-gray-200">{auth.user.name}</div>
                <div className="font-medium text-sm text-gray-500">{auth.user.email}</div>
              </div>

              <div className="mt-3 space-y-1">
                <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                <ResponsiveNavLink href={route('library.index')}>My Library</ResponsiveNavLink>
                <ResponsiveNavLink href={route('history.index')}>Reading History</ResponsiveNavLink>
                <ResponsiveNavLink method="post" href={route('logout')} as="button">
                  Log Out
                </ResponsiveNavLink>
                
                <div className="px-4 py-2 flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">Dark Mode</span>
                  <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-3 border-t border-gray-200 dark:border-gray-600">
              <div className="px-4 flex flex-col space-y-3">
                <Link
                  href={route('login')}
                  className="w-full text-center block px-4 py-2 text-sm leading-5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 transition duration-150 ease-in-out"
                >
                  Log in
                </Link>

                <Link
                  href={route('register')}
                  className="w-full text-center block px-4 py-2 text-sm leading-5 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700 transition duration-150 ease-in-out"
                >
                  Register
                </Link>
                
                <div className="py-2 flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">Dark Mode</span>
                  <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span className="ml-2 font-bold text-xl">MangaPulse</span>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Discover, read, and track your favorite manga and manhwa titles all in one place.
                Our platform aggregates content from various sources to provide you with the best reading experience.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Explore</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/manga" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Browse All
                  </Link>
                </li>
                <li>
                  <Link href="/manga?sort=popularity" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Popular
                  </Link>
                </li>
                <li>
                  <Link href="/manga?sort=latest" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Latest Updates
                  </Link>
                </li>
                <li>
                  <Link href="/manga?status=completed" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Completed
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Links</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              &copy; {new Date().getFullYear()} MangaPulse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}