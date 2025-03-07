import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import MangaCard from '@/components/MangaCard';
import { Manga, MangaFilters, StatusList, SortOptions } from '@/types/manga';

interface MangaIndexProps {
  manga: Manga[];
  filters: MangaFilters;
  genres: string[];
  statuses: StatusList;
  sortOptions: SortOptions;
}

export default function Index({ manga, filters, genres, statuses, sortOptions }: MangaIndexProps) {
  const [showFilters, setShowFilters] = useState(false);
  
  const applyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const search = (form.elements.namedItem('search') as HTMLInputElement).value;
    const genre = (form.elements.namedItem('genre') as HTMLSelectElement).value;
    const status = (form.elements.namedItem('status') as HTMLSelectElement).value;
    const sort = (form.elements.namedItem('sort') as HTMLSelectElement).value;
    
    router.get(route('manga.index'), {
      search: search || undefined,
      genre: genre || undefined,
      status: status || undefined,
      sort: sort || undefined,
    }, {
      preserveState: true,
    });
  };
  
  const clearFilters = () => {
    router.get(route('manga.index'), {}, {
      preserveState: true,
    });
  };
  
  return (
    <AppLayout>
      <Head title="Browse Manga - MangaPulse" />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
              Browse Manga
            </h1>
            
            <div className="flex items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mr-4 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round" 
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              <span className="text-gray-500 dark:text-gray-400">
                {manga.length} results
              </span>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl mb-6 p-4 border border-gray-100 dark:border-gray-700">
              <form onSubmit={applyFilters}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      id="search"
                      name="search"
                      defaultValue={filters.search}
                      placeholder="Title, author..."
                      className="w-full rounded-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Genre
                    </label>
                    <select
                      id="genre"
                      name="genre"
                      defaultValue={filters.genre}
                      className="w-full rounded-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                    >
                      <option value="">All Genres</option>
                      {genres.map((genre, index) => (
                        <option key={index} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={filters.status}
                      className="w-full rounded-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                    >
                      <option value="">All Status</option>
                      {Object.entries(statuses).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sort By
                    </label>
                    <select
                      id="sort"
                      name="sort"
                      defaultValue={filters.sort}
                      className="w-full rounded-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                    >
                      {Object.entries(sortOptions).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Active Filters */}
          {(filters.search || filters.genre || filters.status) && (
            <div className="mb-6 flex flex-wrap items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">
                Active Filters:
              </span>
              
              {filters.search && (
                <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 text-xs py-1 px-2 rounded-full m-1">
                  Search: {filters.search}
                </span>
              )}
              
              {filters.genre && (
                <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 text-xs py-1 px-2 rounded-full m-1">
                  Genre: {filters.genre}
                </span>
              )}
              
              {filters.status && (
                <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 text-xs py-1 px-2 rounded-full m-1">
                  Status: {statuses[filters.status]}
                </span>
              )}
              
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 ml-auto transition"
              >
                Clear All
              </button>
            </div>
          )}
          
          {/* Manga Grid */}
          {manga.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {manga.map((item, index) => (
                <MangaCard key={index} manga={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 mb-6">No manga found. Try adjusting your filters.</p>
              {(filters.search || filters.genre || filters.status) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-800/60 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}