import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import AppLayout from '@/layouts/AppLayout';
import GenreTag from '@/components/GenreTag';
import MangaCard from '@/components/MangaCard';
import { Manga, Chapter } from '@/types/manga';
import { Auth } from '@/types/user';

interface MangaShowProps {
  manga: Manga;
  chapters: Chapter[];
  similarManga: Manga[];
  auth: Auth;
}

export default function Show({ manga, chapters, similarManga, auth }: MangaShowProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'chapters' | 'similar'>('chapters');

  const { data, setData, post, processing, reset, errors } = useForm({
    manga_id: manga.id,
    source: manga.source,
    status: 'reading' as const,
    manga_title: manga.title,
    cover_image: manga.cover_image || '',
  });

  // Group chapters by volume
  const chaptersByVolume = chapters.reduce<Record<string, Chapter[]>>((acc, chapter) => {
    const volume = chapter.volume || 'No Volume';
    if (!acc[volume]) {
      acc[volume] = [];
    }
    acc[volume].push(chapter);
    return acc;
  }, {});

  // Sort volumes
  const sortedVolumes = Object.keys(chaptersByVolume).sort((a, b) => {
    // Handle "No Volume" case
    if (a === 'No Volume') return 1;
    if (b === 'No Volume') return -1;
    
    // Sort numerically
    return parseFloat(a) - parseFloat(b);
  });

  const addToLibrary = (e: React.FormEvent) => {
    e.preventDefault();
    
    post(route('library.add'), {
      onSuccess: () => {
        toast.success('Added to your library');
        reset();
      },
    });
  };

  const toggleDescription = () => {
    setShowAll(!showAll);
  };

  return (
    <AppLayout>
      <Head title={`${manga.title} - MangaPulse`} />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Manga Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="md:flex">
              {/* Cover Image */}
              <div className="md:flex-shrink-0 p-6 flex justify-center md:justify-start">
                <div className="w-48 h-64 md:w-56 md:h-80 relative shadow-md rounded-lg overflow-hidden">
                  {manga.cover_image ? (
                    <img
                      src={manga.cover_image}
                      alt={manga.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16"
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
              </div>
              
              {/* Manga Info */}
              <div className="p-6 md:p-8 flex-1">
                <div className="flex flex-wrap justify-between items-start">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {manga.title}
                    </h1>
                    
                    {manga.alt_titles && manga.alt_titles.length > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Also known as: {manga.alt_titles.slice(0, 2).join(', ')}
                        {manga.alt_titles.length > 2 && '...'}
                      </p>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  {manga.status && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(manga.status)}`}>
                      {formatStatus(manga.status)}
                    </span>
                  )}
                </div>
                
                {/* Authors & Artists */}
                <div className="mb-4">
                  {manga.authors && manga.authors.length > 0 && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Author:</strong> {manga.authors.join(', ')}
                    </p>
                  )}
                  
                  {manga.artists && manga.artists.length > 0 && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Artist:</strong> {manga.artists.join(', ')}
                    </p>
                  )}
                </div>
                
                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mb-4">
                  {manga.year && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Year</span>
                      <p className="text-gray-900 dark:text-white">{manga.year}</p>
                    </div>
                  )}
                  
                  {manga.score && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Score</span>
                      <p className="text-gray-900 dark:text-white">{manga.score}/10</p>
                    </div>
                  )}
                  
                  {manga.publication_demographic && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Demographic</span>
                      <p className="text-gray-900 dark:text-white capitalize">{manga.publication_demographic}</p>
                    </div>
                  )}
                </div>
                
                {/* Genres */}
                {manga.genres && manga.genres.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Genres</h3>
                    <div className="flex flex-wrap">
                      {manga.genres.map((genre, index) => (
                        <GenreTag key={index} genre={genre} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {chapters.length > 0 && (
                    <Link
                      href={route('chapter.show', {
                        mangaId: manga.id,
                        chapterId: chapters[0].id,
                        source: manga.source,
                      })}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-full font-medium text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Start Reading
                    </Link>
                  )}
                  
                  {auth.user && (
                    <form onSubmit={addToLibrary}>
                      <div className="flex items-center gap-2">
                        <select
                          value={data.status}
                          onChange={(e) => setData('status', e.target.value as any)}
                          className="rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="reading">Reading</option>
                          <option value="completed">Completed</option>
                          <option value="on_hold">On Hold</option>
                          <option value="dropped">Dropped</option>
                          <option value="plan_to_read">Plan to Read</option>
                        </select>
                        
                        <button
                          type="submit"
                          disabled={processing}
                          className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full font-medium text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Add to Library
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description */}
            {manga.description && (
              <div className="px-6 pb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Synopsis</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className={`text-gray-700 dark:text-gray-300 ${!showAll && 'line-clamp-4'}`}>
                    {manga.description}
                  </p>
                  {manga.description.length > 200 && (
                    <button
                      onClick={toggleDescription}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mt-2 text-sm font-medium"
                    >
                      {showAll ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Tabs */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'chapters'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Chapters
                </button>
                <button
                  onClick={() => setActiveTab('similar')}
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'similar'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Similar Manga
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-4 md:p-6">
              {/* Chapters Tab */}
              {activeTab === 'chapters' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Chapters</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
                    </span>
                  </div>
                  
                  {sortedVolumes.length > 0 ? (
                    <div className="space-y-6">
                      {sortedVolumes.map((volume) => (
                        <div key={volume}>
                          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {volume === 'No Volume' ? 'Chapters' : `Volume ${volume}`}
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg overflow-hidden">
                            {chaptersByVolume[volume].map((chapter, index) => (
                              <Link
                                key={chapter.id}
                                href={route('chapter.show', {
                                  mangaId: manga.id,
                                  chapterId: chapter.id,
                                  source: manga.source,
                                })}
                                className={`flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition ${
                                  index !== chaptersByVolume[volume].length - 1
                                    ? 'border-b border-gray-200 dark:border-gray-700'
                                    : ''
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {formatChapterTitle(chapter)}
                                    </span>
                                    
                                    {chapter.title && chapter.title !== formatChapterTitle(chapter) && (
                                      <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">
                                        {chapter.title}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {chapter.published_at && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {new Date(chapter.published_at).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-gray-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No chapters available yet.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Similar Manga Tab */}
              {activeTab === 'similar' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Similar Manga</h3>
                  
                  {similarManga.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {similarManga.map((item, index) => (
                        <MangaCard key={index} manga={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No similar manga found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
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
      return 'On Hiatus';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function formatChapterTitle(chapter: Chapter): string {
  let formattedTitle = '';
  
  if (chapter.chapter) {
    formattedTitle = `Chapter ${chapter.chapter}`;
  } else {
    formattedTitle = 'Chapter';
  }
  
  return formattedTitle;
}