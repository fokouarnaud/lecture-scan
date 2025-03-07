import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import AppLayout from '@/layouts/AppLayout';
import Pagination from '@/components/Pagination';

interface ReadingProgress {
  data: Array<{
    id: number;
    manga_id: number;
    source: string;
    manga_title: string;
    chapter_id: string;
    chapter_title?: string;
    chapter_number?: number;
    last_page: number;
    total_pages: number;
    read_at: string;
  }>;
  links: any[];
}

export default function History({ readingProgress }: { readingProgress: ReadingProgress }) {
  return (
    <AppLayout>
      <Head title="Reading History - Manga Reader" />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Reading History
          </h1>
          
          {readingProgress.data.length > 0 ? (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {readingProgress.data.map((progress) => (
                    <li key={progress.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center p-4 sm:px-6">
                        {/* Date */}
                        <div className="flex-shrink-0 text-center mr-6 hidden sm:block">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(progress.read_at), 'MMM')}
                          </div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {format(new Date(progress.read_at), 'd')}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(progress.read_at), 'yyyy')}
                          </div>
                        </div>
                        
                        {/* Manga Title */}
                        <div className="min-w-0 flex-1">
                          <Link
                            href={route('manga.show', { id: progress.manga_id, source: progress.source })}
                            className="focus:outline-none"
                          >
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                              {progress.manga_title}
                            </p>
                          </Link>
                          
                          <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span>
                              {progress.chapter_title || `Chapter ${progress.chapter_number || '?'}`}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              Page {progress.last_page} of {progress.total_pages}
                            </span>
                            <span className="mx-2 sm:hidden">•</span>
                            <span className="sm:hidden">
                              {format(new Date(progress.read_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="ml-4 flex-shrink-0">
                          <Link
                            href={route('chapter.show', {
                              mangaId: progress.manga_id,
                              chapterId: progress.chapter_id,
                              source: progress.source,
                            })}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Continue
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Pagination */}
              <div className="mt-6">
                <Pagination links={readingProgress.links} />
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                Your reading history is empty. Start reading some manga!
              </p>
              <Link
                href={route('manga.index')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Browse Manga
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}