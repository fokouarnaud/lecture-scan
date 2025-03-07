import React from 'react';
import { Link } from '@inertiajs/react';

interface GenreTagProps {
  genre: string;
  className?: string;
}

export default function GenreTag({ genre, className = '' }: GenreTagProps) {
  return (
    <Link
      href={`/manga/genre/${genre}`}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800/70 transition-colors mr-2 mb-2 ${className}`}
    >
      {genre}
    </Link>
  );
}