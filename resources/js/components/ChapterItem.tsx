import React from 'react';
import { Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Chapter } from '@/types/manga';

interface ChapterItemProps {
  chapter: Chapter;
}

export default function ChapterItem({ chapter }: ChapterItemProps) {
  const publishedAt = chapter.published_at 
    ? new Date(chapter.published_at)
    : (chapter.created_at ? new Date(chapter.created_at) : new Date());
  
  const timeAgo = formatDistanceToNow(publishedAt, { addSuffix: true });
  
  return (
    <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* Manga Cover */}
      <Link href={`/manga/${chapter.manga_id}/${chapter.source}`}>
        <div className="h-16 w-12 flex-shrink-0 bg-gray-200 dark:bg-gray-700/60 rounded-md overflow-hidden mr-4">
          {chapter.cover_image ? (
            <img
              src={chapter.cover_image}
              alt={chapter.manga_title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
        </div>
      </Link>
      
      {/* Chapter Info */}
      <div className="flex-1 min-w-0">
        <Link 
          href={`/manga/${chapter.manga_id}/${chapter.source}`}
          className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1"
        >
          {chapter.manga_title}
        </Link>
        
        <Link 
          href={`/manga/${chapter.manga_id}/chapter/${chapter.id}/${chapter.source}`}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline line-clamp-1"
        >
          {formatChapterTitle(chapter)}
        </Link>
      </div>
      
      {/* Time Ago */}
      <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
        {timeAgo}
      </div>
    </div>
  );
}

// Helper function to format chapter title
function formatChapterTitle(chapter: Chapter): string {
  if (chapter.title && chapter.title !== 'null' && chapter.title !== '') {
    return chapter.title;
  }
  
  let formattedTitle = '';
  
  if (chapter.volume) {
    formattedTitle += `Vol. ${chapter.volume} `;
  }
  
  if (chapter.chapter) {
    formattedTitle += `Ch. ${chapter.chapter}`;
  } else {
    formattedTitle += 'Chapter';
  }
  
  return formattedTitle;
}