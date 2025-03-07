import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import AppLayout from '@/layouts/AppLayout';
import { Manga } from '@/types/manga';
import { StatusList } from '@/types/manga';

interface LibraryProps {
  mangaList: Manga[];
  statuses: StatusList;
}

type StatusKey = 'all' | 'reading' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_read';

export default function Library({ mangaList, statuses }: LibraryProps) {
  const [activeTab, setActiveTab] = useState<StatusKey>('all');
  
  // Filter manga by status
  const filteredManga = activeTab === 'all'
    ? mangaList
    : mangaList.filter(manga => manga.library_status === activeTab);
  
  const updateStatus = (mangaId: string, source: string, status: string) => {
    router.patch(route('library.update-status', { mangaId }), {
      source,
      status,
    }, {
      preserveState: true,
      onSuccess: () => toast.success('Status updated'),
    });
  };
  
  const removeManga = (mangaId: string, source: string) => {
    if (confirm('Are you sure you want to remove this manga from your library?')) {
      router.delete(route('library.remove', { mangaId }), {
        data: { source },
        onSuccess: () => toast.success('Removed from library'),
      });
    }
  };
  
  return (
    <AppLayout>
      <Head title="My Library - MangaPulse" />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            My Library
          </h1>
          
          {/* Status Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex overflow-x-auto" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('all')}
                className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                All
              </button>
              
              {Object.entries(statuses).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as StatusKey)}
                  className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {value}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Manga List */}
          {filteredManga.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredManga.map((manga) => (
                  <li key={`${manga.id}-${manga.source}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <div className="flex items-center p-4 sm:px-6">
                      {/* Manga Cover */}
                      <div className="flex-shrink-0 h-24 w-16 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden mr-4">
                        {manga.cover_image ? (
                          <img
                            src={manga.cover_image}
                            alt={manga.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8"
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
                      
                      {/* Manga Info */}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={route('manga.show', { id: manga.id, source: manga.source })}
                          className="focus:outline-none"
                        >
                          <span className="absolute inset-0" aria-hidden="true" />
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {manga.title}
                          </p>
                        </Link>
                        
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                          {manga.authors && manga.authors.length > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {manga.authors.join(', ')}
                            </p>
                          )}
                          
                          {manga.status && (
                            <p className="mt-1 sm:mt-0 text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {formatStatus(manga.status)}
                            </p>
                          )}
                        </div>
                        
                        {/* Reading Progress */}
                        {manga.reading_progress && (
                          <div className="mt-2">
                            <Link
                              href={route('chapter.show', {
                                mangaId: manga.id,
                                chapterId: manga.reading_progress.chapter_id,
                                source: manga.source,
                              })}
                              className="inline-flex items-center text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                              Continue Reading: {manga.reading_progress.chapter_number 
                                ? `Chapter ${manga.reading_progress.chapter_number}` 
                                : manga.reading_progress.chapter_title}
                            </Link>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                        <select
                          value={manga.library_status}
                          onChange={(e) => updateStatus(manga.id, manga.source, e.target.value)}
                          className="rounded-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                        >
                          {Object.entries(statuses).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          ))}
                        </select>
                        
                        <button
                          onClick={() => removeManga(manga.id, manga.source)}
                          className="text-gray-400 hover:text-rose-500 transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Remove from Library"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {activeTab === 'all'
                  ? "Your library is empty. Start by adding manga to your collection!"
                  : `You don't have any manga with the status "${statuses[activeTab]}".`}
              </p>
              <Link
                href={route('manga.index')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
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

// Helper function to format status
function formatStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'ongoing':
      return 'Ongoing';
    case 'completed':
      return 'Completed';
    case 'hiatus':
      return 'On Hiatus';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}