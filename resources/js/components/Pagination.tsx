import React from 'react';
import { Link } from '@inertiajs/react';
import { PaginationLink } from '@/types/user';

interface PaginationProps {
  links: PaginationLink[];
}

export default function Pagination({ links }: PaginationProps) {
  // If there's only one page, don't show pagination
  if (links.length <= 3) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      {links.map((link, index) => {
        // Skip "prev" link if we're on first page
        if (index === 0 && link.url === null) {
          return null;
        }
        
        // Skip "next" link if we're on last page
        if (index === links.length - 1 && link.url === null) {
          return null;
        }
        
        return (
          <Link
            key={index}
            href={link.url ?? ''}
            className={`px-4 py-2 text-sm rounded-md transition ${
              link.active
                ? 'bg-indigo-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                : link.url
                ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        );
      })}
    </div>
  );
}