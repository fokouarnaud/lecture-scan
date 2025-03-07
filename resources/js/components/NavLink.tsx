import React from 'react';
import { Link } from '@inertiajs/react';

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

export default function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
        active
          ? 'border-indigo-500 text-gray-900 dark:text-white focus:border-indigo-700'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 focus:text-gray-700 focus:border-gray-300'
      }`}
    >
      {children}
    </Link>
  );
}