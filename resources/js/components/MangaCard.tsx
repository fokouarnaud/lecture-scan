import React from 'react';
import { Link } from '@inertiajs/react';
import { Manga } from '@/types/manga';

interface MangaCardProps {
  manga: Manga;
  className?: string;
}

export default function MangaCard({ manga, className = '' }: MangaCardProps) {
  return (
    <Link
      href={`/manga/${manga.id}/${manga.source}`}
      className={`group flex flex-col rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800/60 backdrop-blur-sm ${className}`}
    >
      {/* Manga Cover */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700/60">
        {manga.cover_image ? (
          <img
            src={manga.cover_image}
            alt={manga.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        {manga.status && (
          <div className="absolute top-2 right-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(manga.status)}`}>
              {formatStatus(manga.status)}
            </span>
          </div>
        )}
      </div>
      
      {/* Manga Info */}
      <div className="p-3 flex-grow">
        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">
          {manga.title}
        </h3>
        
        {/* Authors */}
        {manga.authors && manga.authors.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
            {manga.authors.join(', ')}
          </p>
        )}
      </div>
    </Link>
  );
}

// Helper functions
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'ongoing':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300';
    case 'completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-300';
    case 'hiatus':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-300';
    case 'cancelled':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

function formatStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'ongoing':
      return 'Ongoing';
    case 'completed':
      return 'Completed';
    case 'hiatus':
      return 'Hiatus';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}